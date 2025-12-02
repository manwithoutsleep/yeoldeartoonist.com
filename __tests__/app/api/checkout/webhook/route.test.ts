/**
 * Stripe Webhook Handler Tests
 *
 * Tests for Stripe webhook event processing.
 * Tests signature verification, event handling, and error scenarios.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/checkout/webhook/route';
import { NextRequest } from 'next/server';
import type Stripe from 'stripe';

// Mock dependencies
vi.mock('@/lib/payments/stripe', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructWebhookEvent: vi.fn((payload, signature, _secret) => {
        if (signature === 'invalid_signature') {
            throw new Error('Invalid signature');
        }
        const parsedPayload = JSON.parse(payload as string);
        return {
            id: 'evt_test_123',
            type: parsedPayload.type,
            data: parsedPayload.data,
        };
    }),
    generateOrderNumber: vi.fn(() => 'YOA-20250112-0001'),
}));

vi.mock('@/lib/db/orders', () => ({
    createOrder: vi.fn().mockResolvedValue({
        data: {
            id: 'order_123',
            orderNumber: 'YOA-20250112-0001',
        },
        error: null,
    }),
}));

import { constructWebhookEvent } from '@/lib/payments/stripe';
import { createOrder } from '@/lib/db/orders';

describe('POST /api/checkout/webhook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set environment variable for tests
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
    });

    function createMockRequest(
        payload: string,
        signature: string
    ): NextRequest {
        return {
            text: async () => payload,
            headers: {
                get: (name: string) => {
                    if (name === 'stripe-signature') return signature;
                    return null;
                },
            },
        } as unknown as NextRequest;
    }

    function createPaymentIntentEvent(
        type: string,
        paymentIntentData: Partial<Stripe.PaymentIntent>
    ): string {
        return JSON.stringify({
            type,
            data: {
                object: {
                    id: 'pi_test_123',
                    amount: 10500,
                    currency: 'usd',
                    metadata: {
                        customerName: 'John Doe',
                        customerEmail: 'john@example.com',
                    },
                    ...paymentIntentData,
                },
            },
        });
    }

    it('should return 400 for missing signature', async () => {
        const payload = createPaymentIntentEvent(
            'payment_intent.succeeded',
            {}
        );
        const request = createMockRequest(payload, '');

        // Override the headers to return null for signature
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        request.headers.get = (_name: string) => null;

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Missing signature');
    });

    it('should return 400 for invalid signature', async () => {
        const payload = createPaymentIntentEvent(
            'payment_intent.succeeded',
            {}
        );
        const request = createMockRequest(payload, 'invalid_signature');

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid signature');
    });

    it('should verify webhook signature', async () => {
        const payload = createPaymentIntentEvent(
            'payment_intent.succeeded',
            {}
        );
        const signature = 't=123,v1=valid_signature';
        const request = createMockRequest(payload, signature);

        await POST(request);

        expect(constructWebhookEvent).toHaveBeenCalledWith(
            payload,
            signature,
            'whsec_test_secret'
        );
    });

    it('should handle payment_intent.succeeded event', async () => {
        const payload = createPaymentIntentEvent('payment_intent.succeeded', {
            metadata: {
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
            },
        });
        const signature = 't=123,v1=valid_signature';
        const request = createMockRequest(payload, signature);

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
    });

    it('should handle payment_intent.payment_failed event', async () => {
        const payload = createPaymentIntentEvent(
            'payment_intent.payment_failed',
            {
                last_payment_error: {
                    message: 'Card declined',
                } as Stripe.PaymentIntent.LastPaymentError,
            }
        );
        const signature = 't=123,v1=valid_signature';
        const request = createMockRequest(payload, signature);

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
    });

    it('should handle unhandled event types', async () => {
        const payload = JSON.stringify({
            type: 'customer.created',
            data: { object: {} },
        });
        const signature = 't=123,v1=valid_signature';
        const request = createMockRequest(payload, signature);

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
    });

    it('should return 200 even on processing errors', async () => {
        // Mock createOrder to throw an error
        (createOrder as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new Error('Database error')
        );

        const payload = createPaymentIntentEvent(
            'payment_intent.succeeded',
            {}
        );
        const signature = 't=123,v1=valid_signature';
        const request = createMockRequest(payload, signature);

        const response = await POST(request);
        const data = await response.json();

        // Should still return 200 to prevent Stripe retries
        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
    });

    it('should return 500 if webhook secret not configured', async () => {
        // Remove webhook secret
        delete process.env.STRIPE_WEBHOOK_SECRET;

        const payload = createPaymentIntentEvent(
            'payment_intent.succeeded',
            {}
        );
        const signature = 't=123,v1=valid_signature';
        const request = createMockRequest(payload, signature);

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Webhook not configured');

        // Restore for other tests
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
    });
});

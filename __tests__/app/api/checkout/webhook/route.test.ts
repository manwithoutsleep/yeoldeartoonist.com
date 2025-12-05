/**
 * Stripe Webhook Handler Tests
 *
 * Tests for Stripe webhook event processing.
 * Tests signature verification, event handling, and error scenarios.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/checkout/webhook/route';
import { NextRequest } from 'next/server';
import type Stripe from 'stripe';

// Mock dependencies
vi.mock('@/lib/payments/stripe', () => ({
    constructWebhookEvent: vi.fn((payload, signature) => {
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
        request.headers.get = () => null;

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

    it('should handle payment_intent.succeeded event and create order', async () => {
        const shippingAddress = {
            line1: '123 Main St',
            line2: 'Apt 4B',
            city: 'Portland',
            state: 'OR',
            zip: '97201',
            country: 'US',
        };
        const items = [
            {
                artworkId: '123e4567-e89b-12d3-a456-426614174000',
                quantity: 1,
                price: 100,
            },
        ];

        const payload = createPaymentIntentEvent('payment_intent.succeeded', {
            metadata: {
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                shippingAddress: JSON.stringify(shippingAddress),
                billingAddress: JSON.stringify(shippingAddress),
                items: JSON.stringify(items),
                subtotal: '100.00',
                shippingCost: '5.00',
                taxAmount: '0.00',
                total: '105.00',
                orderNotes: 'Test order',
            },
        });
        const signature = 't=123,v1=valid_signature';
        const request = createMockRequest(payload, signature);

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);

        // Verify createOrder was called with correct data
        expect(createOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                orderNumber: 'YOA-20250112-0001',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                shippingAddress,
                billingAddress: shippingAddress,
                orderNotes: 'Test order',
                subtotal: 100,
                shippingCost: 5,
                taxAmount: 0,
                total: 105,
                paymentIntentId: 'pi_test_123',
                paymentStatus: 'succeeded',
                items: [
                    {
                        artworkId: '123e4567-e89b-12d3-a456-426614174000',
                        quantity: 1,
                        priceAtPurchase: 100,
                        lineSubtotal: 100,
                    },
                ],
            })
        );
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

        const shippingAddress = {
            line1: '123 Main St',
            city: 'Portland',
            state: 'OR',
            zip: '97201',
            country: 'US',
        };

        const payload = createPaymentIntentEvent('payment_intent.succeeded', {
            metadata: {
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                shippingAddress: JSON.stringify(shippingAddress),
                billingAddress: JSON.stringify(shippingAddress),
                items: JSON.stringify([
                    { artworkId: 'test-id', quantity: 1, price: 100 },
                ]),
                subtotal: '100.00',
                shippingCost: '5.00',
                taxAmount: '0.00',
                total: '105.00',
            },
        });
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

    describe('Tax extraction from PaymentIntent', () => {
        it('should extract tax from PaymentIntent.automatic_tax.amount', async () => {
            const shippingAddress = {
                line1: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                zip: '90001',
                country: 'US',
            };
            const items = [
                {
                    artworkId: '123e4567-e89b-12d3-a456-426614174000',
                    quantity: 1,
                    price: 100,
                },
            ];

            const payload = createPaymentIntentEvent(
                'payment_intent.succeeded',
                {
                    automatic_tax: {
                        enabled: true,
                        status: 'complete',
                        amount: 850, // $8.50 tax in cents
                    },
                    metadata: {
                        customerName: 'John Doe',
                        customerEmail: 'john@example.com',
                        shippingAddress: JSON.stringify(shippingAddress),
                        billingAddress: JSON.stringify(shippingAddress),
                        items: JSON.stringify(items),
                        subtotal: '100.00',
                        shippingCost: '5.00',
                    },
                } as Partial<Stripe.PaymentIntent> & {
                    automatic_tax?: {
                        enabled: boolean;
                        status: string;
                        amount: number;
                    };
                }
            );
            const signature = 't=123,v1=valid_signature';
            const request = createMockRequest(payload, signature);

            await POST(request);

            expect(createOrder).toHaveBeenCalledWith(
                expect.objectContaining({
                    taxAmount: 8.5, // Converted from cents to dollars
                    total: 113.5, // subtotal + shipping + tax
                })
            );
        });

        it('should create order with correct tax amount', async () => {
            const shippingAddress = {
                line1: '456 Broadway',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'US',
            };

            const payload = createPaymentIntentEvent(
                'payment_intent.succeeded',
                {
                    automatic_tax: {
                        enabled: true,
                        status: 'complete',
                        amount: 975, // $9.75 tax
                    },
                    metadata: {
                        customerName: 'Jane Doe',
                        customerEmail: 'jane@example.com',
                        shippingAddress: JSON.stringify(shippingAddress),
                        billingAddress: JSON.stringify(shippingAddress),
                        items: JSON.stringify([
                            {
                                artworkId:
                                    '123e4567-e89b-12d3-a456-426614174000',
                                quantity: 1,
                                price: 100,
                            },
                        ]),
                        subtotal: '100.00',
                        shippingCost: '5.00',
                    },
                } as Partial<Stripe.PaymentIntent> & {
                    automatic_tax?: {
                        enabled: boolean;
                        status: string;
                        amount: number;
                    };
                }
            );
            const signature = 't=123,v1=valid_signature';
            const request = createMockRequest(payload, signature);

            await POST(request);

            expect(createOrder).toHaveBeenCalledWith(
                expect.objectContaining({
                    subtotal: 100,
                    shippingCost: 5,
                    taxAmount: 9.75,
                    total: 114.75,
                })
            );
        });

        it('should handle PaymentIntents without tax (backwards compatibility)', async () => {
            const shippingAddress = {
                line1: '321 Pine St',
                city: 'Portland',
                state: 'OR',
                zip: '97201',
                country: 'US',
            };

            // Old PaymentIntent without automatic_tax field
            const payload = createPaymentIntentEvent(
                'payment_intent.succeeded',
                {
                    // No automatic_tax field
                    metadata: {
                        customerName: 'John Doe',
                        customerEmail: 'john@example.com',
                        shippingAddress: JSON.stringify(shippingAddress),
                        billingAddress: JSON.stringify(shippingAddress),
                        items: JSON.stringify([
                            {
                                artworkId:
                                    '123e4567-e89b-12d3-a456-426614174000',
                                quantity: 1,
                                price: 100,
                            },
                        ]),
                        subtotal: '100.00',
                        shippingCost: '5.00',
                    },
                }
            );
            const signature = 't=123,v1=valid_signature';
            const request = createMockRequest(payload, signature);

            await POST(request);

            expect(createOrder).toHaveBeenCalledWith(
                expect.objectContaining({
                    taxAmount: 0, // Should default to 0
                    total: 105, // subtotal + shipping only
                })
            );
        });

        it('should convert tax from cents to dollars correctly', async () => {
            const shippingAddress = {
                line1: '123 Main St',
                city: 'Austin',
                state: 'TX',
                zip: '78701',
                country: 'US',
            };

            const payload = createPaymentIntentEvent(
                'payment_intent.succeeded',
                {
                    automatic_tax: {
                        enabled: true,
                        status: 'complete',
                        amount: 863, // $8.63 in cents
                    },
                    metadata: {
                        customerName: 'Bob Smith',
                        customerEmail: 'bob@example.com',
                        shippingAddress: JSON.stringify(shippingAddress),
                        billingAddress: JSON.stringify(shippingAddress),
                        items: JSON.stringify([
                            {
                                artworkId:
                                    '123e4567-e89b-12d3-a456-426614174000',
                                quantity: 1,
                                price: 100,
                            },
                        ]),
                        subtotal: '100.00',
                        shippingCost: '5.00',
                    },
                } as Partial<Stripe.PaymentIntent> & {
                    automatic_tax?: {
                        enabled: boolean;
                        status: string;
                        amount: number;
                    };
                }
            );
            const signature = 't=123,v1=valid_signature';
            const request = createMockRequest(payload, signature);

            await POST(request);

            expect(createOrder).toHaveBeenCalledWith(
                expect.objectContaining({
                    taxAmount: 8.63, // Precisely converted
                })
            );
        });

        it('should calculate order total including tax', async () => {
            const shippingAddress = {
                line1: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                zip: '90001',
                country: 'US',
            };

            const payload = createPaymentIntentEvent(
                'payment_intent.succeeded',
                {
                    automatic_tax: {
                        enabled: true,
                        status: 'complete',
                        amount: 1950, // $19.50 tax for larger order
                    },
                    metadata: {
                        customerName: 'Alice Johnson',
                        customerEmail: 'alice@example.com',
                        shippingAddress: JSON.stringify(shippingAddress),
                        billingAddress: JSON.stringify(shippingAddress),
                        items: JSON.stringify([
                            {
                                artworkId:
                                    '123e4567-e89b-12d3-a456-426614174000',
                                quantity: 2,
                                price: 100,
                            },
                        ]),
                        subtotal: '200.00',
                        shippingCost: '5.00',
                    },
                } as Partial<Stripe.PaymentIntent> & {
                    automatic_tax?: {
                        enabled: boolean;
                        status: string;
                        amount: number;
                    };
                }
            );
            const signature = 't=123,v1=valid_signature';
            const request = createMockRequest(payload, signature);

            await POST(request);

            expect(createOrder).toHaveBeenCalledWith(
                expect.objectContaining({
                    subtotal: 200,
                    shippingCost: 5,
                    taxAmount: 19.5,
                    total: 224.5, // 200 + 5 + 19.5
                })
            );
        });
    });
});

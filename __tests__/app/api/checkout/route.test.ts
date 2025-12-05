/**
 * Checkout API Route Tests
 *
 * Tests for payment intent creation API endpoint.
 * Tests validation, cart verification, and Stripe integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/checkout/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/payments/stripe', () => ({
    createPaymentIntent: vi.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 11000,
        currency: 'usd',
        metadata: {},
    }),
    createPaymentIntentWithTax: vi.fn().mockResolvedValue({
        paymentIntent: {
            id: 'pi_test_123',
            client_secret: 'pi_test_123_secret_abc',
            amount: 11350,
            currency: 'usd',
            metadata: {},
        },
        taxAmount: 8.5,
        total: 113.5,
    }),
}));

vi.mock('@/lib/cart/validation', () => ({
    validateCart: vi.fn().mockResolvedValue({
        isValid: true,
        items: [
            {
                artworkId: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test Artwork',
                price: 100,
                quantity: 1,
                slug: 'test-artwork',
            },
        ],
        subtotal: 100,
        shippingCost: 5,
        taxAmount: 0,
        total: 105,
    }),
}));

import { createPaymentIntentWithTax } from '@/lib/payments/stripe';
import { validateCart } from '@/lib/cart/validation';

describe('POST /api/checkout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const validRequestBody = {
        items: [
            {
                artworkId: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test Artwork',
                price: 100,
                quantity: 1,
                slug: 'test-artwork',
            },
        ],
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        shippingAddress: {
            line1: '123 Main St',
            line2: 'Apt 4B',
            city: 'Portland',
            state: 'OR',
            zip: '97201',
            country: 'US',
        },
        billingAddress: {
            line1: '123 Main St',
            line2: 'Apt 4B',
            city: 'Portland',
            state: 'OR',
            zip: '97201',
            country: 'US',
        },
        orderNotes: 'Please handle with care',
    };

    function createMockRequest(body: unknown): NextRequest {
        return {
            json: async () => body,
        } as NextRequest;
    }

    it('should create payment intent with valid cart', async () => {
        const request = createMockRequest(validRequestBody);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.clientSecret).toBe('pi_test_123_secret_abc');
        expect(data.amount).toBe(105);
    });

    it('should call validateCart with cart items', async () => {
        const request = createMockRequest(validRequestBody);
        await POST(request);

        expect(validateCart).toHaveBeenCalledWith(validRequestBody.items);
    });

    it('should call createPaymentIntentWithTax with correct amount and metadata', async () => {
        const request = createMockRequest(validRequestBody);
        await POST(request);

        expect(createPaymentIntentWithTax).toHaveBeenCalledWith(
            105, // total from validated cart (subtotal + shipping)
            expect.objectContaining({
                line1: '123 Main St',
                line2: 'Apt 4B',
                city: 'Portland',
                state: 'OR',
                postal_code: '97201',
                country: 'US',
            }),
            expect.objectContaining({
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                // Verify addresses are stored as JSON strings
                shippingAddress: JSON.stringify(
                    validRequestBody.shippingAddress
                ),
                billingAddress: JSON.stringify(validRequestBody.billingAddress),
                // Verify items are stored as JSON string
                items: expect.any(String),
                // Verify totals
                subtotal: '100.00',
                shippingCost: '5.00',
                // Verify order notes
                orderNotes: 'Please handle with care',
            })
        );
    });

    it('should return 400 for missing customer name', async () => {
        const invalidBody = {
            ...validRequestBody,
            customerName: '',
        };

        const request = createMockRequest(invalidBody);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid checkout data');
    });

    it('should return 400 for invalid email', async () => {
        const invalidBody = {
            ...validRequestBody,
            customerEmail: 'not-an-email',
        };

        const request = createMockRequest(invalidBody);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid checkout data');
    });

    it('should return 400 for invalid artwork ID', async () => {
        const invalidBody = {
            ...validRequestBody,
            items: [
                {
                    ...validRequestBody.items[0],
                    artworkId: 'not-a-uuid',
                },
            ],
        };

        const request = createMockRequest(invalidBody);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid checkout data');
    });

    it('should return 400 for invalid quantity', async () => {
        const invalidBody = {
            ...validRequestBody,
            items: [
                {
                    ...validRequestBody.items[0],
                    quantity: 0,
                },
            ],
        };

        const request = createMockRequest(invalidBody);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid checkout data');
    });

    it('should return 400 for missing shipping address', async () => {
        const invalidBody = {
            ...validRequestBody,
            shippingAddress: undefined,
        };

        const request = createMockRequest(invalidBody);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid checkout data');
    });

    it('should return 400 for invalid shipping address (missing city)', async () => {
        const invalidBody = {
            ...validRequestBody,
            shippingAddress: {
                ...validRequestBody.shippingAddress,
                city: '',
            },
        };

        const request = createMockRequest(invalidBody);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid checkout data');
    });

    it('should return 400 when cart validation fails', async () => {
        (validateCart as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            isValid: false,
            items: [],
            subtotal: 0,
            shippingCost: 0,
            taxAmount: 0,
            total: 0,
            errors: ['Item not found'],
        });

        const request = createMockRequest(validRequestBody);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Cart validation failed');
        expect(data.details).toEqual(['Item not found']);
    });

    it('should return 500 for Stripe API errors', async () => {
        (
            createPaymentIntentWithTax as ReturnType<typeof vi.fn>
        ).mockRejectedValueOnce(new Error('Stripe API error'));

        const request = createMockRequest(validRequestBody);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to create payment intent');
    });

    it('should include cart metadata in payment intent', async () => {
        const request = createMockRequest(validRequestBody);
        await POST(request);

        expect(createPaymentIntentWithTax).toHaveBeenCalledWith(
            105,
            expect.any(Object),
            expect.objectContaining({
                itemCount: '1',
                subtotal: '100.00',
                shippingCost: '5.00',
            })
        );
    });

    describe('Tax calculation integration', () => {
        it('should create PaymentIntent with automatic tax enabled', async () => {
            const request = createMockRequest(validRequestBody);
            await POST(request);

            // Note: This test will pass when we update the route to use createPaymentIntentWithTax
            expect(createPaymentIntentWithTax).toHaveBeenCalled();
        });

        it('should return tax amount in response body', async () => {
            const request = createMockRequest(validRequestBody);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.taxAmount).toBeDefined();
            expect(typeof data.taxAmount).toBe('number');
        });

        it('should return total including tax in response', async () => {
            const request = createMockRequest(validRequestBody);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.total).toBeDefined();
            expect(typeof data.total).toBe('number');
            expect(data.total).toBeGreaterThan(data.amount); // Total should be amount + tax
        });

        it('should use shipping address for tax calculation', async () => {
            const request = createMockRequest(validRequestBody);
            await POST(request);

            expect(createPaymentIntentWithTax).toHaveBeenCalledWith(
                105, // Total from validated cart
                expect.objectContaining({
                    line1: '123 Main St',
                    line2: 'Apt 4B',
                    city: 'Portland',
                    state: 'OR',
                    postal_code: '97201',
                    country: 'US',
                }),
                expect.any(Object) // metadata
            );
        });

        it('should handle tax calculation errors gracefully', async () => {
            (
                createPaymentIntentWithTax as ReturnType<typeof vi.fn>
            ).mockRejectedValueOnce(new Error('Tax calculation failed'));

            const request = createMockRequest(validRequestBody);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to create payment intent');
        });

        it('should return correct response structure with tax', async () => {
            const request = createMockRequest(validRequestBody);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveProperty('clientSecret');
            expect(data).toHaveProperty('amount');
            expect(data).toHaveProperty('taxAmount');
            expect(data).toHaveProperty('total');
        });

        it('should validate cart before calculating tax', async () => {
            const request = createMockRequest(validRequestBody);
            await POST(request);

            // Verify validateCart is called before createPaymentIntentWithTax
            const validateCallOrder = (validateCart as ReturnType<typeof vi.fn>)
                .mock.invocationCallOrder[0];
            const createPaymentCallOrder = (
                createPaymentIntentWithTax as ReturnType<typeof vi.fn>
            ).mock.invocationCallOrder[0];

            expect(validateCallOrder).toBeLessThan(createPaymentCallOrder);
        });

        it('should include metadata in tax calculation', async () => {
            const request = createMockRequest(validRequestBody);
            await POST(request);

            expect(createPaymentIntentWithTax).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Object),
                expect.objectContaining({
                    customerName: 'John Doe',
                    customerEmail: 'john@example.com',
                })
            );
        });

        it('should handle addresses in tax-free states', async () => {
            (
                createPaymentIntentWithTax as ReturnType<typeof vi.fn>
            ).mockResolvedValueOnce({
                paymentIntent: {
                    id: 'pi_test_or',
                    client_secret: 'pi_test_or_secret',
                    amount: 10500,
                    currency: 'usd',
                    metadata: {},
                },
                taxAmount: 0, // No tax in Oregon
                total: 105,
            });

            const request = createMockRequest(validRequestBody);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.taxAmount).toBe(0);
            expect(data.total).toBe(105); // Same as subtotal + shipping
        });

        it('should handle addresses in high-tax states', async () => {
            const californiaAddress = {
                line1: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                zip: '90001',
                country: 'US',
            };

            const requestBodyCA = {
                ...validRequestBody,
                shippingAddress: californiaAddress,
                billingAddress: californiaAddress,
            };

            (
                createPaymentIntentWithTax as ReturnType<typeof vi.fn>
            ).mockResolvedValueOnce({
                paymentIntent: {
                    id: 'pi_test_ca',
                    client_secret: 'pi_test_ca_secret',
                    amount: 11475,
                    currency: 'usd',
                    metadata: {},
                },
                taxAmount: 9.75, // CA tax
                total: 114.75,
            });

            const request = createMockRequest(requestBodyCA);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.taxAmount).toBe(9.75);
            expect(data.total).toBe(114.75);
        });
    });
});

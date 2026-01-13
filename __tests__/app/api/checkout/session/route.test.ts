/**
 * Tests for POST /api/checkout/session
 *
 * Tests the Stripe Checkout session creation endpoint for:
 * - Session creation with correct parameters
 * - Line items from cart
 * - Automatic tax calculation
 * - Success/cancel URLs
 * - Server-side cart validation
 * - Session URL response
 * - Invalid cart handling
 * - Metadata storage
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/checkout/session/route';
import { NextRequest } from 'next/server';
import type { CartItem } from '@/types/cart';
import type Stripe from 'stripe';
import { siteConfig } from '@/config/site';

// Mock Stripe
vi.mock('@/lib/payments/stripe', () => ({
    stripe: {
        checkout: {
            sessions: {
                create: vi.fn(),
            },
        },
    },
}));

// Mock cart validation
vi.mock('@/lib/cart/validation', () => ({
    validateCart: vi.fn(),
}));

describe('POST /api/checkout/session', () => {
    const validCartItems: CartItem[] = [
        {
            artworkId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Artwork 1',
            price: 50.0,
            quantity: 2,
            slug: 'test-artwork-1',
        },
        {
            artworkId: '123e4567-e89b-12d3-a456-426614174001',
            title: 'Test Artwork 2',
            price: 75.0,
            quantity: 1,
            slug: 'test-artwork-2',
        },
    ];

    beforeEach(async () => {
        vi.clearAllMocks();

        const { stripe } = await import('@/lib/payments/stripe');
        const { validateCart } = await import('@/lib/cart/validation');

        // Default mock for successful session creation
        vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/c/pay/cs_test_123',
            payment_intent: 'pi_test_123',
            object: 'checkout.session',
            livemode: false,
            mode: 'payment',
            status: 'open',
        } as unknown as Stripe.Response<Stripe.Checkout.Session>);

        // Default mock for successful cart validation
        vi.mocked(validateCart).mockResolvedValue({
            isValid: true,
            items: validCartItems,
            subtotal: 175.0,
            shippingCost: siteConfig.shipping.flat_rate / 100,
            taxAmount: 0,
            total: 180.0,
        });
    });

    it('creates a Stripe Checkout session', async () => {
        const { stripe } = await import('@/lib/payments/stripe');

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('url');
        expect(data.url).toBe('https://checkout.stripe.com/c/pay/cs_test_123');
        expect(stripe.checkout.sessions.create).toHaveBeenCalledTimes(1);
    });

    it('includes line items from cart', async () => {
        const { stripe } = await import('@/lib/payments/stripe');

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        await POST(request);

        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                line_items: expect.arrayContaining([
                    expect.objectContaining({
                        price_data: expect.objectContaining({
                            product_data: expect.objectContaining({
                                name: 'Test Artwork 1',
                            }),
                            unit_amount: 5000, // $50.00 in cents
                        }),
                        quantity: 2,
                    }),
                    expect.objectContaining({
                        price_data: expect.objectContaining({
                            product_data: expect.objectContaining({
                                name: 'Test Artwork 2',
                            }),
                            unit_amount: 7500, // $75.00 in cents
                        }),
                        quantity: 1,
                    }),
                ]),
            })
        );
    });

    it('enables automatic tax calculation', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        await POST(request);

        const { stripe } = await import('@/lib/payments/stripe');
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                automatic_tax: {
                    enabled: true,
                },
            })
        );
    });

    it('sets correct success/cancel URLs', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        await POST(request);

        const { stripe } = await import('@/lib/payments/stripe');
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                success_url: expect.stringContaining(
                    '/shoppe/checkout/success?session_id={CHECKOUT_SESSION_ID}'
                ),
                cancel_url: expect.stringContaining('/shoppe/cart'),
            })
        );
    });

    it('validates cart server-side', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        await POST(request);

        const { validateCart } = await import('@/lib/cart/validation');
        expect(validateCart).toHaveBeenCalledWith(validCartItems);
    });

    it('returns session URL to client', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
            url: 'https://checkout.stripe.com/c/pay/cs_test_123',
        });
    });

    it('handles invalid cart items', async () => {
        const { validateCart } = await import('@/lib/cart/validation');

        vi.mocked(validateCart).mockResolvedValue({
            isValid: false,
            items: [],
            subtotal: 0,
            shippingCost: siteConfig.shipping.flat_rate / 100,
            taxAmount: 0,
            total: 0,
            errors: [
                'Item "Test Artwork 1" not found',
                'Item "Test Artwork 2" is no longer available',
            ],
        });

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.message).toBeDefined();
        const { stripe } = await import('@/lib/payments/stripe');
        expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it('stores metadata for order creation', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        await POST(request);

        const { stripe } = await import('@/lib/payments/stripe');
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: {
                    cartItems: JSON.stringify([
                        {
                            artworkId: '123e4567-e89b-12d3-a456-426614174000',
                            quantity: 2,
                            price: 50.0,
                        },
                        {
                            artworkId: '123e4567-e89b-12d3-a456-426614174001',
                            quantity: 1,
                            price: 75.0,
                        },
                    ]),
                },
            })
        );
    });

    it('handles invalid request body schema', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [
                        {
                            // Missing required fields
                            artworkId: 'invalid-uuid',
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.message).toBeDefined();
    });

    it('includes customer email when provided', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                    customerEmail: 'test@example.com',
                }),
            }
        );

        await POST(request);

        const { stripe } = await import('@/lib/payments/stripe');
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                customer_email: 'test@example.com',
            })
        );
    });

    it('handles Stripe API errors gracefully', async () => {
        const { stripe } = await import('@/lib/payments/stripe');

        vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(
            new Error('Stripe API error: Invalid API key')
        );

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error.code).toBe('PAYMENT_ERROR');
        expect(data.error.message).toBeDefined();
    });

    it('includes shipping options in session', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        await POST(request);

        const { stripe } = await import('@/lib/payments/stripe');
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                shipping_options: [
                    {
                        shipping_rate_data: {
                            type: 'fixed_amount',
                            fixed_amount: {
                                amount: siteConfig.shipping.flat_rate, // in cents
                                currency: 'usd',
                            },
                            display_name: 'Standard Shipping',
                        },
                    },
                ],
            })
        );
    });

    it('requires shipping address collection', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        await POST(request);

        const { stripe } = await import('@/lib/payments/stripe');
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                shipping_address_collection: {
                    allowed_countries: ['US'],
                },
            })
        );
    });

    it('requires billing address collection', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        await POST(request);

        const { stripe } = await import('@/lib/payments/stripe');
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                billing_address_collection: 'required',
            })
        );
    });

    it('sets payment mode correctly', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/session',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: validCartItems,
                }),
            }
        );

        await POST(request);

        const { stripe } = await import('@/lib/payments/stripe');
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: 'payment',
            })
        );
    });
});

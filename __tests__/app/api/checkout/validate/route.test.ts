/**
 * Validation API Route Tests
 *
 * Tests for the POST /api/checkout/validate endpoint that validates
 * shopping cart data server-side.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/validate/route';
import { NextRequest } from 'next/server';

// Mock cart validation function
vi.mock('@/lib/cart/validation', () => ({
    validateCart: vi.fn(),
}));

describe('POST /api/checkout/validate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return validated cart for valid request', async () => {
        const { validateCart } = await import('@/lib/cart/validation');

        const artworkId = '123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(validateCart).mockResolvedValue({
            isValid: true,
            items: [
                {
                    artworkId,
                    title: 'Test Artwork',
                    price: 50.0,
                    quantity: 2,
                    slug: 'test-artwork',
                },
            ],
            subtotal: 100.0,
            shippingCost: 5.0,
            taxAmount: 0,
            total: 105.0,
        });

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [
                        {
                            artworkId,
                            title: 'Test Artwork',
                            price: 50.0,
                            quantity: 2,
                            slug: 'test-artwork',
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.cart).toBeDefined();
        expect(data.cart.isValid).toBe(true);
        expect(data.cart.total).toBe(105.0);
    });

    it('should return 400 for invalid cart data schema', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [
                        {
                            artworkId: 'not-a-uuid', // Invalid UUID
                            title: 'Test',
                            price: 50.0,
                            quantity: 2,
                            slug: 'test',
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid cart data');
        expect(data.details).toBeDefined();
    });

    it('should return 400 for negative price', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [
                        {
                            artworkId: '123e4567-e89b-12d3-a456-426614174000',
                            title: 'Test',
                            price: -10.0, // Invalid negative price
                            quantity: 1,
                            slug: 'test',
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid cart data');
    });

    it('should return 400 for negative or zero quantity', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [
                        {
                            artworkId: '123e4567-e89b-12d3-a456-426614174000',
                            title: 'Test',
                            price: 50.0,
                            quantity: 0, // Invalid zero quantity
                            slug: 'test',
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid cart data');
    });

    it('should return 400 for cart validation failure', async () => {
        const { validateCart } = await import('@/lib/cart/validation');

        vi.mocked(validateCart).mockResolvedValue({
            isValid: false,
            items: [],
            subtotal: 0,
            shippingCost: 0,
            taxAmount: 0,
            total: 0,
            errors: [
                'Item "Test Artwork" not found',
                'Price mismatch detected',
            ],
        });

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [
                        {
                            artworkId: '123e4567-e89b-12d3-a456-426614174000',
                            title: 'Test Artwork',
                            price: 50.0,
                            quantity: 1,
                            slug: 'test-artwork',
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Cart validation failed');
        expect(data.cart).toBeDefined();
        expect(data.cart.isValid).toBe(false);
        expect(data.cart.errors).toContain('Item "Test Artwork" not found');
    });

    it('should return 400 for tampered prices', async () => {
        const { validateCart } = await import('@/lib/cart/validation');

        vi.mocked(validateCart).mockResolvedValue({
            isValid: false,
            items: [],
            subtotal: 0,
            shippingCost: 0,
            taxAmount: 0,
            total: 0,
            errors: [
                'Price for "Test Artwork" has changed. Please refresh your cart.',
            ],
        });

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [
                        {
                            artworkId: '123e4567-e89b-12d3-a456-426614174000',
                            title: 'Test Artwork',
                            price: 10.0, // Tampered price
                            quantity: 1,
                            slug: 'test-artwork',
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Cart validation failed');
        expect(data.cart.errors).toContain(
            'Price for "Test Artwork" has changed. Please refresh your cart.'
        );
    });

    it('should return 400 for out-of-stock items', async () => {
        const { validateCart } = await import('@/lib/cart/validation');

        vi.mocked(validateCart).mockResolvedValue({
            isValid: false,
            items: [],
            subtotal: 0,
            shippingCost: 0,
            taxAmount: 0,
            total: 0,
            errors: ['Only 0 of "Out of Stock Item" available'],
        });

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [
                        {
                            artworkId: '123e4567-e89b-12d3-a456-426614174000',
                            title: 'Out of Stock Item',
                            price: 50.0,
                            quantity: 1,
                            slug: 'out-of-stock',
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.cart.errors).toContain(
            'Only 0 of "Out of Stock Item" available'
        );
    });

    it('should return 500 for internal server errors', async () => {
        const { validateCart } = await import('@/lib/cart/validation');

        // Mock validateCart to throw an error
        vi.mocked(validateCart).mockRejectedValue(
            new Error('Database connection failed')
        );

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [
                        {
                            artworkId: '123e4567-e89b-12d3-a456-426614174000',
                            title: 'Test',
                            price: 50.0,
                            quantity: 1,
                            slug: 'test',
                        },
                    ],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
    });

    it('should handle malformed JSON', async () => {
        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: 'not valid json',
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
    });

    it('should validate empty cart', async () => {
        const { validateCart } = await import('@/lib/cart/validation');

        vi.mocked(validateCart).mockResolvedValue({
            isValid: false,
            items: [],
            subtotal: 0,
            shippingCost: 0,
            taxAmount: 0,
            total: 0,
            errors: ['Cart is empty'],
        });

        const request = new NextRequest(
            'http://localhost:3000/api/checkout/validate',
            {
                method: 'POST',
                body: JSON.stringify({
                    items: [],
                }),
            }
        );

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.cart.errors).toContain('Cart is empty');
    });
});

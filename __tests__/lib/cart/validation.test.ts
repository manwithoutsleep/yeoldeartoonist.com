/**
 * Cart Validation Tests
 *
 * Tests for server-side cart validation logic including item existence,
 * pricing validation, inventory checks, and total calculations.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validateCart } from '@/lib/cart/validation';
import type { CartItem } from '@/types/cart';
import { siteConfig } from '@/config/site';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
    createServiceRoleClient: vi.fn(),
}));

describe('validateCart', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('empty cart validation', () => {
        it('should return invalid for empty cart', async () => {
            const result = await validateCart([]);

            expect(result.isValid).toBe(false);
            expect(result.items).toEqual([]);
            expect(result.subtotal).toBe(0);
            expect(result.shippingCost).toBe(0);
            expect(result.taxAmount).toBe(0);
            expect(result.total).toBe(0);
            expect(result.errors).toContain('Cart is empty');
        });
    });

    describe('item existence validation', () => {
        it('should validate that all items exist in database', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'artwork-1',
                                    title: 'Test Artwork',
                                    price: 50.0,
                                    inventory_count: 10,
                                    is_published: true,
                                    slug: 'test-artwork',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'Test Artwork',
                    price: 50.0,
                    quantity: 2,
                    slug: 'test-artwork',
                },
            ];

            const result = await validateCart(items);

            expect(result.isValid).toBe(true);
            expect(result.items).toHaveLength(1);
        });

        it('should return error for non-existent items', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [], // No matching artwork
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'non-existent',
                    title: 'Missing Item',
                    price: 50.0,
                    quantity: 1,
                    slug: 'missing-item',
                },
            ];

            const result = await validateCart(items);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Item "Missing Item" not found');
        });
    });

    describe('published status validation', () => {
        it('should reject unpublished items', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'artwork-1',
                                    title: 'Unpublished Artwork',
                                    price: 50.0,
                                    inventory_count: 10,
                                    is_published: false, // Not published
                                    slug: 'unpublished',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'Unpublished Artwork',
                    price: 50.0,
                    quantity: 1,
                    slug: 'unpublished',
                },
            ];

            const result = await validateCart(items);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Item "Unpublished Artwork" is no longer available'
            );
        });
    });

    describe('price validation (tampering detection)', () => {
        it('should detect price tampering', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'artwork-1',
                                    title: 'Test Artwork',
                                    price: 100.0, // Actual price
                                    inventory_count: 10,
                                    is_published: true,
                                    slug: 'test-artwork',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'Test Artwork',
                    price: 50.0, // Tampered price
                    quantity: 1,
                    slug: 'test-artwork',
                },
            ];

            const result = await validateCart(items);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Price for "Test Artwork" has changed. Please refresh your cart.'
            );
        });
    });

    describe('inventory validation', () => {
        it('should reject items with insufficient inventory', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'artwork-1',
                                    title: 'Low Stock',
                                    price: 50.0,
                                    inventory_count: 2, // Only 2 available
                                    is_published: true,
                                    slug: 'low-stock',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'Low Stock',
                    price: 50.0,
                    quantity: 5, // Requesting more than available
                    slug: 'low-stock',
                },
            ];

            const result = await validateCart(items);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Only 2 of "Low Stock" available');
        });

        it('should accept items with sufficient inventory', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'artwork-1',
                                    title: 'In Stock',
                                    price: 50.0,
                                    inventory_count: 10,
                                    is_published: true,
                                    slug: 'in-stock',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'In Stock',
                    price: 50.0,
                    quantity: 5,
                    slug: 'in-stock',
                },
            ];

            const result = await validateCart(items);

            expect(result.isValid).toBe(true);
            expect(result.items).toHaveLength(1);
        });
    });

    describe('total calculations', () => {
        it('should calculate subtotal correctly', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'artwork-1',
                                    title: 'Item 1',
                                    price: 25.0,
                                    inventory_count: 10,
                                    is_published: true,
                                    slug: 'item-1',
                                },
                                {
                                    id: 'artwork-2',
                                    title: 'Item 2',
                                    price: 50.0,
                                    inventory_count: 10,
                                    is_published: true,
                                    slug: 'item-2',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'Item 1',
                    price: 25.0,
                    quantity: 2, // 50.00
                    slug: 'item-1',
                },
                {
                    artworkId: 'artwork-2',
                    title: 'Item 2',
                    price: 50.0,
                    quantity: 1, // 50.00
                    slug: 'item-2',
                },
            ];

            const result = await validateCart(items);

            expect(result.isValid).toBe(true);
            expect(result.subtotal).toBe(100.0); // 50 + 50
        });

        it('should apply flat rate shipping as set in siteConfig', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'artwork-1',
                                    title: 'Test',
                                    price: 50.0,
                                    inventory_count: 10,
                                    is_published: true,
                                    slug: 'test',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'Test',
                    price: 50.0,
                    quantity: 1,
                    slug: 'test',
                },
            ];

            const result = await validateCart(items);

            expect(result.shippingCost).toBe(
                siteConfig.shipping.flat_rate / 100
            );
        });

        it('should calculate total correctly (subtotal + shipping + tax)', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const expectedSubtotal = 100.0;
            const expectedShipping = siteConfig.shipping.flat_rate / 100;
            const expectedTax = 0; // Assuming tax is handled by Stripe
            const expectedTotal =
                expectedSubtotal + expectedShipping + expectedTax;

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'artwork-1',
                                    title: 'Test',
                                    price: 50.0,
                                    inventory_count: 10,
                                    is_published: true,
                                    slug: 'test',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'Test',
                    price: 50.0,
                    quantity: 2,
                    slug: 'test',
                },
            ];

            const result = await validateCart(items);

            expect(result.subtotal).toBe(expectedSubtotal);
            expect(result.shippingCost).toBe(expectedShipping);
            expect(result.taxAmount).toBe(expectedTax);
            expect(result.total).toBe(expectedTotal);
        });
    });

    describe('database error handling', () => {
        it('should handle database errors gracefully', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Database connection failed' },
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'Test',
                    price: 50.0,
                    quantity: 1,
                    slug: 'test',
                },
            ];

            const result = await validateCart(items);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Failed to validate cart items');
        });
    });

    describe('multiple validation errors', () => {
        it('should collect all validation errors', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                {
                                    id: 'artwork-1',
                                    title: 'Unpublished',
                                    price: 50.0,
                                    inventory_count: 10,
                                    is_published: false, // Not published
                                    slug: 'unpublished',
                                },
                                {
                                    id: 'artwork-2',
                                    title: 'Out of Stock',
                                    price: 30.0,
                                    inventory_count: 0, // No inventory
                                    is_published: true,
                                    slug: 'out-of-stock',
                                },
                            ],
                            error: null,
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const items: CartItem[] = [
                {
                    artworkId: 'artwork-1',
                    title: 'Unpublished',
                    price: 50.0,
                    quantity: 1,
                    slug: 'unpublished',
                },
                {
                    artworkId: 'artwork-2',
                    title: 'Out of Stock',
                    price: 30.0,
                    quantity: 1,
                    slug: 'out-of-stock',
                },
                {
                    artworkId: 'artwork-3',
                    title: 'Missing',
                    price: 20.0,
                    quantity: 1,
                    slug: 'missing',
                },
            ];

            const result = await validateCart(items);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(3);
            expect(result.errors).toContain(
                'Item "Unpublished" is no longer available'
            );
            expect(result.errors).toContain(
                'Only 0 of "Out of Stock" available'
            );
            expect(result.errors).toContain('Item "Missing" not found');
        });
    });
});

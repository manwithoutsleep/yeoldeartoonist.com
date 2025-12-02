/**
 * Order Database Tests
 *
 * Tests for order database query functions including order creation,
 * retrieval, updates, and inventory management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, getOrderById, updateOrderStatus } from '@/lib/db/orders';
import type { CreateOrderPayload } from '@/types/order';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
    createServiceRoleClient: vi.fn(),
}));

describe('Order Database Functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create order with correct data', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockOrder = {
                id: 'order-123',
                order_number: 'ORD-2024-001',
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                shipping_address: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                billing_address: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                subtotal: 100.0,
                shipping_cost: 5.0,
                tax_amount: 0,
                total: 105.0,
                status: 'pending',
                payment_status: 'pending',
                payment_intent_id: 'pi_123',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const mockSupabase = {
                from: vi.fn((table: string) => {
                    if (table === 'orders') {
                        return {
                            insert: vi.fn().mockReturnValue({
                                select: vi.fn().mockReturnValue({
                                    single: vi.fn().mockResolvedValue({
                                        data: mockOrder,
                                        error: null,
                                    }),
                                }),
                            }),
                        };
                    }
                    if (table === 'order_items') {
                        return {
                            insert: vi.fn().mockResolvedValue({
                                data: [],
                                error: null,
                            }),
                        };
                    }
                    return {};
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const payload: CreateOrderPayload = {
                orderNumber: 'ORD-2024-001',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                shippingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                billingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                subtotal: 100.0,
                shippingCost: 5.0,
                taxAmount: 0,
                total: 105.0,
                paymentIntentId: 'pi_123',
                items: [
                    {
                        artworkId: 'artwork-1',
                        quantity: 2,
                        priceAtPurchase: 50.0,
                        lineSubtotal: 100.0,
                    },
                ],
            };

            const result = await createOrder(payload);

            expect(result.error).toBeNull();
            expect(result.data).toBeDefined();
            expect(result.data?.customerName).toBe('John Doe');
            expect(result.data?.total).toBe(105.0);
        });

        it('should create order_items for each cart item', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            let orderItemsInserted = false;

            const mockSupabase = {
                from: vi.fn((table: string) => {
                    if (table === 'orders') {
                        return {
                            insert: vi.fn().mockReturnValue({
                                select: vi.fn().mockReturnValue({
                                    single: vi.fn().mockResolvedValue({
                                        data: {
                                            id: 'order-123',
                                            order_number: 'ORD-2024-001',
                                        },
                                        error: null,
                                    }),
                                }),
                            }),
                        };
                    }
                    if (table === 'order_items') {
                        return {
                            insert: vi.fn((items) => {
                                orderItemsInserted = true;
                                expect(items).toHaveLength(2);
                                expect(items[0]).toMatchObject({
                                    order_id: 'order-123',
                                    artwork_id: 'artwork-1',
                                    quantity: 2,
                                    price_at_purchase: 50.0,
                                    line_subtotal: 100.0,
                                });
                                return Promise.resolve({
                                    data: [],
                                    error: null,
                                });
                            }),
                        };
                    }
                    return {};
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const payload: CreateOrderPayload = {
                orderNumber: 'ORD-2024-001',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                shippingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                billingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                subtotal: 150.0,
                shippingCost: 5.0,
                taxAmount: 0,
                total: 155.0,
                paymentIntentId: 'pi_123',
                items: [
                    {
                        artworkId: 'artwork-1',
                        quantity: 2,
                        priceAtPurchase: 50.0,
                        lineSubtotal: 100.0,
                    },
                    {
                        artworkId: 'artwork-2',
                        quantity: 1,
                        priceAtPurchase: 50.0,
                        lineSubtotal: 50.0,
                    },
                ],
            };

            await createOrder(payload);

            expect(orderItemsInserted).toBe(true);
        });

        it('should handle database errors when creating order', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'Database error' },
                            }),
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const payload: CreateOrderPayload = {
                orderNumber: 'ORD-2024-001',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                shippingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                billingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                subtotal: 100.0,
                shippingCost: 5.0,
                taxAmount: 0,
                total: 105.0,
                paymentIntentId: 'pi_123',
                items: [],
            };

            const result = await createOrder(payload);

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.message).toBe('Database error');
        });

        it('should rollback order if order_items fail', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            let orderDeleted = false;

            const mockSupabase = {
                from: vi.fn((table: string) => {
                    if (table === 'orders') {
                        return {
                            insert: vi.fn().mockReturnValue({
                                select: vi.fn().mockReturnValue({
                                    single: vi.fn().mockResolvedValue({
                                        data: { id: 'order-123' },
                                        error: null,
                                    }),
                                }),
                            }),
                            delete: vi.fn().mockReturnValue({
                                eq: vi.fn(() => {
                                    orderDeleted = true;
                                    return Promise.resolve({
                                        data: null,
                                        error: null,
                                    });
                                }),
                            }),
                        };
                    }
                    if (table === 'order_items') {
                        return {
                            insert: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'Items insert failed' },
                            }),
                        };
                    }
                    return {};
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const payload: CreateOrderPayload = {
                orderNumber: 'ORD-2024-001',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                shippingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                billingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                subtotal: 100.0,
                shippingCost: 5.0,
                taxAmount: 0,
                total: 105.0,
                paymentIntentId: 'pi_123',
                items: [
                    {
                        artworkId: 'artwork-1',
                        quantity: 1,
                        priceAtPurchase: 100.0,
                        lineSubtotal: 100.0,
                    },
                ],
            };

            const result = await createOrder(payload);

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(orderDeleted).toBe(true);
        });

        it('should handle general exceptions', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            // Mock a scenario where the supabase client method throws
            const mockSupabase = {
                from: vi.fn(() => {
                    throw new Error('Unexpected database error');
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const payload: CreateOrderPayload = {
                orderNumber: 'ORD-2024-001',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                shippingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                billingAddress: {
                    line1: '123 Main St',
                    city: 'Portland',
                    state: 'OR',
                    zip: '97201',
                    country: 'US',
                },
                subtotal: 100.0,
                shippingCost: 5.0,
                taxAmount: 0,
                total: 105.0,
                paymentIntentId: 'pi_123',
                items: [],
            };

            const result = await createOrder(payload);

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.message).toBe('Unexpected database error');
        });
    });

    describe('getOrderById', () => {
        it('should retrieve order with items by ID', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockOrder = {
                id: 'order-123',
                order_number: 'ORD-2024-001',
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                order_items: [
                    {
                        id: 'item-1',
                        artwork_id: 'artwork-1',
                        quantity: 2,
                        price_at_purchase: 50.0,
                        line_subtotal: 100.0,
                    },
                ],
            };

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: mockOrder,
                                error: null,
                            }),
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const result = await getOrderById('order-123');

            expect(result.error).toBeNull();
            expect(result.data).toBeDefined();
            expect(result.data?.id).toBe('order-123');
            expect(mockSupabase.from).toHaveBeenCalledWith('orders');
        });

        it('should handle order not found', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'Order not found' },
                            }),
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const result = await getOrderById('non-existent');

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockOrder = {
                id: 'order-123',
                status: 'shipped',
            };

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: mockOrder,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const result = await updateOrderStatus('order-123', 'shipped');

            expect(result.error).toBeNull();
            expect(result.data).toBeDefined();
            expect(result.data?.status).toBe('shipped');
        });

        it('should handle update errors', async () => {
            const { createServiceRoleClient } = await import(
                '@/lib/supabase/server'
            );

            const mockSupabase = {
                from: vi.fn().mockReturnValue({
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: { message: 'Update failed' },
                                }),
                            }),
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockSupabase as never
            );

            const result = await updateOrderStatus('order-123', 'shipped');

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
        });
    });
});

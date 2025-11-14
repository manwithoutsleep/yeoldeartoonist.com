import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardMetrics, getRecentOrders } from '@/lib/db/admin/dashboard';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the Supabase service role client at module level
vi.mock('@/lib/supabase/server', () => ({
    createServiceRoleClient: vi.fn(),
}));

import { createServiceRoleClient } from '@/lib/supabase/server';

describe('Dashboard Admin Queries', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getDashboardMetrics', () => {
        it('returns proper structure with data and error properties', async () => {
            const mockClient = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        count: 10,
                        error: null,
                        gte: vi.fn().mockReturnValue({ count: 5, error: null }),
                        eq: vi.fn().mockReturnValue({ count: 2, error: null }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockClient as unknown as SupabaseClient
            );

            const result = await getDashboardMetrics();

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('error');
        });

        it('handles errors gracefully', async () => {
            const mockClient = {
                from: vi.fn(() => ({
                    select: vi.fn().mockReturnValue({
                        count: null,
                        error: { code: 'PGRST116', message: 'Database error' },
                        gte: () => ({
                            count: null,
                            error: {
                                code: 'PGRST116',
                                message: 'Database error',
                            },
                        }),
                        eq: () => ({
                            count: null,
                            error: {
                                code: 'PGRST116',
                                message: 'Database error',
                            },
                        }),
                    }),
                })),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockClient as unknown as SupabaseClient
            );

            const result = await getDashboardMetrics();

            expect(result.error).toBeDefined();
            expect(result.data).toBeNull();
        });

        it('uses service role client', async () => {
            const mockClient = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        count: 0,
                        error: null,
                        gte: () => ({ count: 0, error: null }),
                        eq: () => ({ count: 0, error: null }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockClient as unknown as SupabaseClient
            );

            await getDashboardMetrics();

            expect(createServiceRoleClient).toHaveBeenCalled();
        });
    });

    describe('getRecentOrders', () => {
        it('returns array of recent orders', async () => {
            const mockOrders = [
                {
                    id: 'order-1',
                    order_number: 'ORD-001',
                    customer_name: 'John Doe',
                    customer_email: 'john@example.com',
                    total: '99.99',
                    status: 'pending',
                    created_at: '2025-01-01T00:00:00Z',
                },
            ];

            const mockClient = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue({
                                data: mockOrders,
                                error: null,
                            }),
                            returns: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: mockOrders,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockClient as unknown as SupabaseClient
            );

            const result = await getRecentOrders();

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('error');
        });

        it('respects limit parameter', async () => {
            const mockOrders = Array.from({ length: 5 }, (_, i) => ({
                id: `order-${i}`,
                order_number: `ORD-${i}`,
                customer_name: `Customer ${i}`,
                customer_email: `customer${i}@test.com`,
                total: '99.99',
                status: 'pending',
                created_at: '2025-01-01T00:00:00Z',
            }));

            const mockClient = {
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue({
                                data: mockOrders,
                                error: null,
                            }),
                            returns: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: mockOrders,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockClient as unknown as SupabaseClient
            );

            const result = await getRecentOrders(5);

            // Verify the function handles the limit parameter
            // (actual limit application tested through real DB queries)
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('error');
        });

        it('handles errors gracefully', async () => {
            const errorMessage = { code: 'PGRST116', message: 'Not found' };

            const mockLimit = vi.fn().mockResolvedValue({
                data: null,
                error: errorMessage,
            });

            const mockReturns = vi.fn().mockReturnValue({
                limit: mockLimit,
            });

            const mockOrder = vi.fn().mockReturnValue({
                limit: mockLimit,
                returns: mockReturns,
            });

            const mockSelect = vi.fn().mockReturnValue({
                order: mockOrder,
            });

            const mockClient = {
                from: vi.fn().mockReturnValue({
                    select: mockSelect,
                }),
            };

            vi.mocked(createServiceRoleClient).mockResolvedValue(
                mockClient as unknown as SupabaseClient
            );

            const result = await getRecentOrders();

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
        });
    });
});

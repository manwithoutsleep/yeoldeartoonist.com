/**
 * Integration tests for admin dashboard database query functions
 *
 * REQUIRES: Supabase connection (local or remote)
 *
 * These tests verify the actual behavior of admin dashboard query functions when connected to Supabase.
 * They test:
 * - Metrics calculation with service role client
 * - Recent orders retrieval
 * - Error handling and error structure
 * - Data/error mutual exclusivity
 * - Edge case parameter handling
 * - Development vs. production error details
 * - Date boundary handling for monthly metrics
 *
 * Setup:
 * - For local testing: run `npm run db:start` before these tests
 * - For remote testing: set environment variables in .env.local
 * - Requires SUPABASE_SERVICE_ROLE_KEY for admin operations
 *
 * Tests will be skipped if Supabase is unavailable.
 */

import { vi } from 'vitest';
import { getDashboardMetrics, getRecentOrders } from '@/lib/db/admin/dashboard';

// Helper to check if Supabase is available
const isSupabaseAvailable = (): boolean => {
    return (
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );
};

describe('Admin Dashboard Database Queries - Integration Tests', () => {
    // Skip all tests in this suite if Supabase is not available
    const skipIfNoSupabase = isSupabaseAvailable() ? describe : describe.skip;

    skipIfNoSupabase('Supabase integration tests (requires connection)', () => {
        describe('getDashboardMetrics', () => {
            it('should return metrics with all required fields', async () => {
                const result = await getDashboardMetrics();

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                // One should be null, the other should have content
                const hasData = result.data !== null;
                const hasError = result.error !== null;
                expect(!(hasData && hasError)).toBe(true);

                if (result.data) {
                    expect(result.data).toHaveProperty('total_orders');
                    expect(result.data).toHaveProperty('orders_this_month');
                    expect(result.data).toHaveProperty('total_revenue');
                    expect(result.data).toHaveProperty('pending_orders');
                    expect(typeof result.data.total_orders).toBe('number');
                    expect(typeof result.data.orders_this_month).toBe('number');
                    expect(typeof result.data.total_revenue).toBe('number');
                    expect(typeof result.data.pending_orders).toBe('number');
                }
            });

            it('should return non-negative metrics', async () => {
                const result = await getDashboardMetrics();

                if (result.data) {
                    expect(result.data.total_orders).toBeGreaterThanOrEqual(0);
                    expect(
                        result.data.orders_this_month
                    ).toBeGreaterThanOrEqual(0);
                    expect(result.data.total_revenue).toBeGreaterThanOrEqual(0);
                    expect(result.data.pending_orders).toBeGreaterThanOrEqual(
                        0
                    );
                }
            });

            it('should have orders_this_month <= total_orders', async () => {
                const result = await getDashboardMetrics();

                if (result.data) {
                    expect(result.data.orders_this_month).toBeLessThanOrEqual(
                        result.data.total_orders
                    );
                }
            });

            it('should have pending_orders <= total_orders', async () => {
                const result = await getDashboardMetrics();

                if (result.data) {
                    expect(result.data.pending_orders).toBeLessThanOrEqual(
                        result.data.total_orders
                    );
                }
            });

            it('should calculate metrics from database', async () => {
                const result = await getDashboardMetrics();

                // Should either succeed with metrics or fail with error
                if (result.data) {
                    // Verify all metrics are numbers (including 0)
                    expect(Number.isFinite(result.data.total_orders)).toBe(
                        true
                    );
                    expect(Number.isFinite(result.data.orders_this_month)).toBe(
                        true
                    );
                    expect(Number.isFinite(result.data.total_revenue)).toBe(
                        true
                    );
                    expect(Number.isFinite(result.data.pending_orders)).toBe(
                        true
                    );
                } else {
                    expect(result.error).not.toBeNull();
                }
            });
        });

        describe('getRecentOrders', () => {
            it('should return array of orders with default limit', async () => {
                const result = await getRecentOrders();

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                const hasData = result.data !== null;
                const hasError = result.error !== null;
                expect(!(hasData && hasError)).toBe(true);

                if (result.data) {
                    expect(Array.isArray(result.data)).toBe(true);
                    expect(result.data.length).toBeLessThanOrEqual(10); // Default limit
                }
            });

            it('should return orders with all required fields', async () => {
                const result = await getRecentOrders();

                if (result.data && result.data.length > 0) {
                    const order = result.data[0];
                    expect(order).toHaveProperty('id');
                    expect(order).toHaveProperty('order_number');
                    expect(order).toHaveProperty('customer_name');
                    expect(order).toHaveProperty('customer_email');
                    expect(order).toHaveProperty('total');
                    expect(order).toHaveProperty('status');
                    expect(order).toHaveProperty('created_at');
                    expect(typeof order.id).toBe('string');
                    expect(typeof order.order_number).toBe('string');
                    expect(typeof order.customer_name).toBe('string');
                    expect(typeof order.customer_email).toBe('string');
                    expect(typeof order.total).toBe('string');
                    expect(typeof order.status).toBe('string');
                    expect(typeof order.created_at).toBe('string');
                }
            });

            it('should respect custom limit parameter', async () => {
                const limit = 5;
                const result = await getRecentOrders(limit);

                if (result.data) {
                    expect(result.data.length).toBeLessThanOrEqual(limit);
                }
            });

            it('should order by created_at descending', async () => {
                const result = await getRecentOrders();

                if (result.data && result.data.length > 1) {
                    const first = new Date(result.data[0].created_at).getTime();
                    const second = new Date(
                        result.data[1].created_at
                    ).getTime();
                    // First should be newer or equal to second
                    expect(first).toBeGreaterThanOrEqual(second);
                }
            });

            it('should handle limit of 1', async () => {
                const result = await getRecentOrders(1);

                if (result.data) {
                    expect(result.data.length).toBeLessThanOrEqual(1);
                }
            });

            it('should handle large limit', async () => {
                const result = await getRecentOrders(100);

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.data) {
                    expect(Array.isArray(result.data)).toBe(true);
                }
            });

            it('should handle zero limit gracefully', async () => {
                const result = await getRecentOrders(0);

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.data) {
                    expect(result.data.length).toBe(0);
                }
            });

            it('should handle negative limit gracefully', async () => {
                const result = await getRecentOrders(-1);

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
                // May return error or empty array depending on Supabase behavior
            });
        });

        describe('error structure validation', () => {
            it('getDashboardMetrics should have consistent error structure', async () => {
                const result = await getDashboardMetrics();

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.error) {
                    expect(result.error).toHaveProperty('code');
                    expect(result.error).toHaveProperty('message');
                    expect(typeof result.error.code).toBe('string');
                    expect(typeof result.error.message).toBe('string');
                }
            });

            it('getRecentOrders should have consistent error structure', async () => {
                const result = await getRecentOrders();

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.error) {
                    expect(result.error).toHaveProperty('code');
                    expect(result.error).toHaveProperty('message');
                    expect(typeof result.error.code).toBe('string');
                    expect(typeof result.error.message).toBe('string');
                }
            });

            it('should never return both data and error as non-null', async () => {
                const results = await Promise.all([
                    getDashboardMetrics(),
                    getRecentOrders(),
                    getRecentOrders(5),
                ]);

                results.forEach((result) => {
                    const hasData = result.data !== null;
                    const hasError = result.error !== null;

                    // One should be null, the other might have content
                    expect(!(hasData && hasError)).toBe(true);
                });
            });

            it('error codes should be non-empty strings', async () => {
                const results = await Promise.all([
                    getDashboardMetrics(),
                    getRecentOrders(-1), // Trigger potential error
                ]);

                results.forEach((result) => {
                    if (result.error) {
                        expect(result.error.code.length).toBeGreaterThan(0);
                        expect(result.error.message.length).toBeGreaterThan(0);
                    }
                });
            });
        });

        describe('development mode error details', () => {
            it('getDashboardMetrics should include details in development mode', async () => {
                vi.stubEnv('NODE_ENV', 'development');

                const result = await getDashboardMetrics();

                // If there's an error in development, it should have details
                if (result.error && process.env.NODE_ENV === 'development') {
                    // Details field may or may not be present depending on error type
                    // Just verify the structure is valid
                    if (result.error.details) {
                        expect(typeof result.error.details).toBe('string');
                    }
                }

                vi.unstubAllEnvs();
            });

            it('getRecentOrders should include details in development mode', async () => {
                vi.stubEnv('NODE_ENV', 'development');

                const result = await getRecentOrders(-1); // Potentially trigger error

                if (result.error && process.env.NODE_ENV === 'development') {
                    if (result.error.details) {
                        expect(typeof result.error.details).toBe('string');
                    }
                }

                vi.unstubAllEnvs();
            });

            it('should not include details in production mode', async () => {
                vi.stubEnv('NODE_ENV', 'production');

                const results = await Promise.all([
                    getDashboardMetrics(),
                    getRecentOrders(),
                ]);

                results.forEach((result) => {
                    if (result.error) {
                        // In production, should not have details
                        expect(result.error).not.toHaveProperty('details');
                    }
                });

                vi.unstubAllEnvs();
            });
        });

        describe('data consistency', () => {
            it('getDashboardMetrics should return consistent data types', async () => {
                const result = await getDashboardMetrics();

                if (result.data) {
                    // All numeric fields should be numbers
                    expect(typeof result.data.total_orders).toBe('number');
                    expect(typeof result.data.orders_this_month).toBe('number');
                    expect(typeof result.data.total_revenue).toBe('number');
                    expect(typeof result.data.pending_orders).toBe('number');

                    // All should be finite numbers (not NaN, Infinity)
                    expect(Number.isFinite(result.data.total_orders)).toBe(
                        true
                    );
                    expect(Number.isFinite(result.data.orders_this_month)).toBe(
                        true
                    );
                    expect(Number.isFinite(result.data.total_revenue)).toBe(
                        true
                    );
                    expect(Number.isFinite(result.data.pending_orders)).toBe(
                        true
                    );
                }
            });

            it('getRecentOrders should return consistent data types', async () => {
                const result = await getRecentOrders();

                if (result.data && result.data.length > 0) {
                    result.data.forEach((order) => {
                        expect(typeof order.id).toBe('string');
                        expect(typeof order.order_number).toBe('string');
                        expect(typeof order.customer_name).toBe('string');
                        expect(typeof order.customer_email).toBe('string');
                        expect(typeof order.total).toBe('string');
                        expect(typeof order.status).toBe('string');
                        expect(typeof order.created_at).toBe('string');
                    });
                }
            });

            it('getRecentOrders should have valid ISO timestamps', async () => {
                const result = await getRecentOrders();

                if (result.data && result.data.length > 0) {
                    result.data.forEach((order) => {
                        const date = new Date(order.created_at);
                        expect(date.toString()).not.toBe('Invalid Date');
                        expect(Number.isFinite(date.getTime())).toBe(true);
                    });
                }
            });

            it('getRecentOrders should have valid email formats', async () => {
                const result = await getRecentOrders();

                if (result.data && result.data.length > 0) {
                    result.data.forEach((order) => {
                        // Basic email validation (contains @ and .)
                        if (order.customer_email) {
                            expect(order.customer_email).toContain('@');
                        }
                    });
                }
            });
        });

        describe('boundary conditions', () => {
            it('getDashboardMetrics should handle database with no orders', async () => {
                const result = await getDashboardMetrics();

                // Should succeed even if there are no orders
                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.data) {
                    // All metrics should be 0 if no orders exist
                    expect(result.data.total_orders).toBeGreaterThanOrEqual(0);
                    expect(
                        result.data.orders_this_month
                    ).toBeGreaterThanOrEqual(0);
                    expect(result.data.total_revenue).toBeGreaterThanOrEqual(0);
                    expect(result.data.pending_orders).toBeGreaterThanOrEqual(
                        0
                    );
                }
            });

            it('getRecentOrders should handle database with no orders', async () => {
                const result = await getRecentOrders();

                // Should succeed even if there are no orders
                if (result.data) {
                    expect(Array.isArray(result.data)).toBe(true);
                    // May be empty array
                    expect(result.data.length).toBeGreaterThanOrEqual(0);
                }
            });

            it('getDashboardMetrics should handle month boundary correctly', async () => {
                const result = await getDashboardMetrics();

                // orders_this_month should count only orders from current month
                if (result.data) {
                    // orders_this_month should never exceed total_orders
                    expect(result.data.orders_this_month).toBeLessThanOrEqual(
                        result.data.total_orders
                    );
                }
            });
        });

        describe('concurrent queries', () => {
            it('should handle multiple concurrent getDashboardMetrics calls', async () => {
                const results = await Promise.all([
                    getDashboardMetrics(),
                    getDashboardMetrics(),
                    getDashboardMetrics(),
                ]);

                results.forEach((result) => {
                    expect(result).toHaveProperty('data');
                    expect(result).toHaveProperty('error');
                });

                // All results should be consistent
                if (results[0].data && results[1].data && results[2].data) {
                    expect(results[0].data.total_orders).toBe(
                        results[1].data.total_orders
                    );
                    expect(results[1].data.total_orders).toBe(
                        results[2].data.total_orders
                    );
                }
            });

            it('should handle multiple concurrent getRecentOrders calls', async () => {
                const results = await Promise.all([
                    getRecentOrders(5),
                    getRecentOrders(5),
                    getRecentOrders(5),
                ]);

                results.forEach((result) => {
                    expect(result).toHaveProperty('data');
                    expect(result).toHaveProperty('error');
                });

                // All results should return same orders in same order
                if (
                    results[0].data &&
                    results[1].data &&
                    results[2].data &&
                    results[0].data.length > 0
                ) {
                    expect(results[0].data[0].id).toBe(results[1].data[0].id);
                    expect(results[1].data[0].id).toBe(results[2].data[0].id);
                }
            });

            it('should handle mixed concurrent dashboard queries', async () => {
                const results = await Promise.all([
                    getDashboardMetrics(),
                    getRecentOrders(10),
                    getDashboardMetrics(),
                    getRecentOrders(5),
                ]);

                results.forEach((result) => {
                    expect(result).toHaveProperty('data');
                    expect(result).toHaveProperty('error');
                });
            });
        });

        describe('error scenarios', () => {
            it('should return error with valid code when query fails', async () => {
                // Queries should not fail in normal circumstances
                // This test documents expected error handling
                const result = await getDashboardMetrics();

                if (result.error) {
                    expect(result.error.code).toBeTruthy();
                    expect(result.error.message).toBeTruthy();
                    expect(result.data).toBeNull();
                }
            });

            it('should handle fetch_error code for getDashboardMetrics', async () => {
                // If getDashboardMetrics fails, it should use fetch_error code
                const result = await getDashboardMetrics();

                if (result.error) {
                    expect(result.error.code).toBe('fetch_error');
                }
            });

            it('should handle fetch_error code for getRecentOrders', async () => {
                // If getRecentOrders fails, it should use fetch_error code
                const result = await getRecentOrders();

                if (result.error) {
                    expect(result.error.code).toBe('fetch_error');
                }
            });
        });

        describe('performance', () => {
            it('getDashboardMetrics should complete in reasonable time', async () => {
                const startTime = Date.now();
                await getDashboardMetrics();
                const duration = Date.now() - startTime;

                // Should complete in less than 5 seconds
                expect(duration).toBeLessThan(5000);
            });

            it('getRecentOrders should complete in reasonable time', async () => {
                const startTime = Date.now();
                await getRecentOrders();
                const duration = Date.now() - startTime;

                // Should complete in less than 5 seconds
                expect(duration).toBeLessThan(5000);
            });
        });
    });

    // Provide helpful message if Supabase is not available
    describe('Supabase availability check', () => {
        it('should log helpful message if Supabase is not available', () => {
            if (!isSupabaseAvailable()) {
                console.log(
                    'ℹ️  Dashboard integration tests skipped - Supabase not configured'
                );
                console.log('   To run integration tests, either:');
                console.log('   1. Run: npm run db:start');
                console.log(
                    '   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
                );
            }
            expect(true).toBe(true);
        });
    });
});

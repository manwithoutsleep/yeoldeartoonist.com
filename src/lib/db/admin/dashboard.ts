/**
 * Admin Dashboard Query Functions
 *
 * Provides functions for fetching dashboard metrics and recent orders.
 * All functions use the service role client to bypass RLS.
 */

import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Error type for dashboard queries
 */
export interface DashboardMetricsError {
    code: string;
    message: string;
    details?: string;
}

/**
 * Dashboard metrics data
 */
export interface DashboardMetrics {
    total_orders: number;
    orders_this_month: number;
    total_revenue: number;
    pending_orders: number;
}

/**
 * Recent order data
 */
export interface RecentOrder {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total: string;
    status: string;
    created_at: string;
}

/**
 * Get dashboard metrics (total orders, revenue, pending orders, etc.)
 *
 * NOTE: This function must be called from server-side code only.
 * Place in server components or API routes to enforce this requirement.
 *
 * @returns Promise with dashboard metrics data and error
 */
export async function getDashboardMetrics(): Promise<{
    data: DashboardMetrics | null;
    error: DashboardMetricsError | null;
}> {
    try {
        const supabase = await createServiceRoleClient();

        // Get total orders count
        const { count: totalOrders, error: totalOrdersError } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true });

        if (totalOrdersError) {
            return {
                data: null,
                error: {
                    code: totalOrdersError.code || 'unknown',
                    message: totalOrdersError.message,
                    ...(process.env.NODE_ENV === 'development' && {
                        details: totalOrdersError.details,
                    }),
                },
            };
        }

        // Get orders this month count
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthOrders, error: monthOrdersError } = await supabase
            .from('orders')
            .select('id', {
                count: 'exact',
                head: true,
            })
            .gte('created_at', startOfMonth.toISOString());

        if (monthOrdersError) {
            return {
                data: null,
                error: {
                    code: monthOrdersError.code || 'unknown',
                    message: monthOrdersError.message,
                    ...(process.env.NODE_ENV === 'development' && {
                        details: monthOrdersError.details,
                    }),
                },
            };
        }

        // Get total revenue
        const { data: revenueData, error: revenueError } = await supabase
            .from('orders')
            .select('total');

        if (revenueError) {
            return {
                data: null,
                error: {
                    code: revenueError.code || 'unknown',
                    message: revenueError.message,
                    ...(process.env.NODE_ENV === 'development' && {
                        details: revenueError.details,
                    }),
                },
            };
        }

        // Calculate total revenue
        const totalRevenue =
            (revenueData as Array<{ total: string }>)?.reduce((sum, order) => {
                return sum + parseFloat(order.total);
            }, 0) || 0;

        // Get pending orders count
        const { count: pendingOrders, error: pendingError } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (pendingError) {
            return {
                data: null,
                error: {
                    code: pendingError.code || 'unknown',
                    message: pendingError.message,
                    ...(process.env.NODE_ENV === 'development' && {
                        details: pendingError.details,
                    }),
                },
            };
        }

        return {
            data: {
                total_orders: totalOrders || 0,
                orders_this_month: monthOrders || 0,
                total_revenue: totalRevenue,
                pending_orders: pendingOrders || 0,
            },
            error: null,
        };
    } catch (err) {
        console.error('getDashboardMetrics failed:', err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to fetch dashboard metrics',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get recent orders
 *
 * NOTE: This function must be called from server-side code only.
 * Place in server components or API routes to enforce this requirement.
 *
 * @param limit - Number of orders to return (default 10)
 * @returns Promise with array of recent orders and error
 */
export async function getRecentOrders(limit = 10): Promise<{
    data: RecentOrder[] | null;
    error: DashboardMetricsError | null;
}> {
    try {
        const supabase = await createServiceRoleClient();

        const { data, error } = await supabase
            .from('orders')
            .select(
                'id, order_number, customer_name, customer_email, total, status, created_at'
            )
            .order('created_at', { ascending: false })
            .limit(limit)
            .returns<RecentOrder[]>();

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code || 'unknown',
                    message: error.message,
                    ...(process.env.NODE_ENV === 'development' && {
                        details: error.details,
                    }),
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        console.error('getRecentOrders failed:', err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to fetch recent orders',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

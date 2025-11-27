import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

export interface OrderWithItems extends OrderRow {
    order_items: OrderItemRow[];
}

export interface OrderAdminError {
    code: string;
    message: string;
    details?: string;
}

export interface OrderFilters {
    status?: OrderStatus;
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
}

export async function getAllOrders(
    limit: number = 20,
    offset: number = 0,
    filters?: OrderFilters
): Promise<{ data: OrderRow[] | null; error: OrderAdminError | null }> {
    if (typeof window !== 'undefined') {
        throw new Error('Admin queries must run server-side only');
    }

    try {
        const supabase = await createServiceRoleClient();
        let query = supabase.from('orders').select('*', { count: 'exact' });

        // Apply filters
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.startDate) {
            query = query.gte('created_at', filters.startDate);
        }
        if (filters?.endDate) {
            query = query.lte('created_at', filters.endDate);
        }

        // Apply pagination and sorting
        const { data, error } = await query
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to fetch orders',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function getOrderById(id: string): Promise<{
    data: OrderWithItems | null;
    error: OrderAdminError | null;
}> {
    if (typeof window !== 'undefined') {
        throw new Error('Admin queries must run server-side only');
    }

    try {
        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('orders')
            .select(
                `
                *,
                order_items (
                    id,
                    order_id,
                    artwork_id,
                    quantity,
                    price_at_purchase,
                    line_subtotal,
                    created_at
                )
            `
            )
            .eq('id', id)
            .single();

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to fetch order',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function updateOrderStatus(
    id: string,
    status: OrderStatus
): Promise<{ data: OrderRow | null; error: OrderAdminError | null }> {
    if (typeof window !== 'undefined') {
        throw new Error('Admin queries must run server-side only');
    }

    try {
        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'update_error',
                message: 'Failed to update order status',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function addOrderNote(
    id: string,
    note: string
): Promise<{ data: OrderRow | null; error: OrderAdminError | null }> {
    if (typeof window !== 'undefined') {
        throw new Error('Admin queries must run server-side only');
    }

    try {
        const supabase = await createServiceRoleClient();

        // First, get the current order to append to existing notes
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('admin_notes')
            .eq('id', id)
            .single();

        if (fetchError) {
            return {
                data: null,
                error: {
                    code: fetchError.code,
                    message: fetchError.message,
                },
            };
        }

        // Format the new note with timestamp
        const timestamp = new Date()
            .toISOString()
            .replace('T', ' ')
            .slice(0, 16);
        const formattedNote = `[${timestamp}] ${note}`;

        // Append to existing notes or create new
        const updatedNotes = order.admin_notes
            ? `${order.admin_notes}\n${formattedNote}`
            : formattedNote;

        // Update the order
        const { data, error } = await supabase
            .from('orders')
            .update({ admin_notes: updatedNotes })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'update_error',
                message: 'Failed to add order note',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function addTrackingNumber(
    id: string,
    tracking: string
): Promise<{ data: OrderRow | null; error: OrderAdminError | null }> {
    if (typeof window !== 'undefined') {
        throw new Error('Admin queries must run server-side only');
    }

    try {
        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('orders')
            .update({ shipping_tracking_number: tracking })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'update_error',
                message: 'Failed to add tracking number',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

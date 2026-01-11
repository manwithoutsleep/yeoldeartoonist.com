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

export interface OrderItemWithArtwork extends OrderItemRow {
    artwork: {
        title: string;
        sku: string | null;
        image_thumbnail_url: string | null;
        slug: string;
    } | null;
}

export interface OrderWithItemsAndArtwork
    extends Omit<OrderRow, 'order_items'> {
    order_items: OrderItemWithArtwork[];
}

/**
 * Artwork fields to select when joining with order items.
 * These fields provide essential information for displaying artwork in admin order views:
 * - title: Display name of the artwork
 * - sku: Product identifier for inventory management
 * - image_thumbnail_url: Small image for order item previews
 * - slug: URL-friendly identifier for linking to artwork detail pages
 *
 * Note: artwork may be null if the artwork has been deleted after order creation.
 * Database indexes on order_items.artwork_id and artwork.id ensure efficient joins.
 */
const ARTWORK_FIELDS = `
    title,
    sku,
    image_thumbnail_url,
    slug
` as const;

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

/**
 * Retrieves a paginated list of orders with optional filtering.
 *
 * This query supports:
 * - Pagination via limit/offset for efficient data loading
 * - Status filtering (pending, paid, processing, shipped, delivered, cancelled)
 * - Date range filtering via startDate and endDate (ISO format)
 * - Results ordered by creation date (newest first)
 *
 * Performance considerations:
 * - Indexed on orders.created_at for efficient sorting
 * - Indexed on orders.status for efficient filtering
 * - Default limit of 20 prevents large result sets
 *
 * @param limit - Maximum number of orders to return (default: 20)
 * @param offset - Number of orders to skip for pagination (default: 0)
 * @param filters - Optional filters for status and date range
 * @returns Promise resolving to array of orders or error
 */
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

/**
 * Retrieves a single order by ID with order items and artwork details.
 *
 * This query performs a nested join:
 * 1. Orders table (main query)
 * 2. Left join with order_items (one order has many items)
 * 3. Left join with artwork (each item references one artwork)
 *
 * The artwork join uses LEFT JOIN semantics, meaning:
 * - If artwork has been deleted after order creation, artwork will be null
 * - All order items will still be returned regardless of artwork existence
 * - Callers should handle null artwork gracefully in the UI
 *
 * Performance considerations:
 * - Indexed on orders.id (primary key)
 * - Indexed on order_items.order_id (foreign key)
 * - Indexed on order_items.artwork_id (foreign key)
 * - Query typically returns 1 order with 1-5 items
 *
 * @param id - UUID of the order to retrieve
 * @returns Promise resolving to order with items and artwork, or error
 */
export async function getOrderById(id: string): Promise<{
    data: OrderWithItemsAndArtwork | null;
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
                    created_at,
                    artwork (${ARTWORK_FIELDS})
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

/**
 * Updates the status of an order.
 *
 * This operation:
 * - Updates the order status to a new value
 * - Automatically updates the updated_at timestamp via database trigger
 * - Returns the updated order record for verification
 *
 * Valid status transitions:
 * - pending → paid → processing → shipped → delivered
 * - Any status → cancelled (for order cancellation)
 *
 * Performance considerations:
 * - Indexed on orders.id (primary key) for efficient updates
 * - Single atomic update operation
 *
 * @param id - UUID of the order to update
 * @param status - New order status (pending, paid, processing, shipped, delivered, cancelled)
 * @returns Promise resolving to updated order or error
 */
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

/**
 * Adds a timestamped note to an order's admin notes.
 *
 * This operation:
 * - Fetches the current admin_notes field
 * - Prepends timestamp in format [YYYY-MM-DD HH:MM]
 * - Appends new note to existing notes (preserves history)
 * - Updates order and returns updated record
 *
 * Note format: "[2025-01-11 14:30] Customer requested gift wrap"
 *
 * Use cases:
 * - Track customer service interactions
 * - Document special handling instructions
 * - Record internal order processing notes
 *
 * Performance considerations:
 * - Requires two queries (fetch + update) for data integrity
 * - Both queries indexed on orders.id (primary key)
 * - Timestamp generated server-side for consistency
 *
 * @param id - UUID of the order to add note to
 * @param note - Text content of the note (timestamp will be prepended automatically)
 * @returns Promise resolving to updated order or error
 */
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

/**
 * Adds or updates the shipping tracking number for an order.
 *
 * This operation:
 * - Updates the shipping_tracking_number field
 * - Automatically updates the updated_at timestamp via database trigger
 * - Returns the updated order record for verification
 *
 * Common use cases:
 * - Adding tracking number when order ships
 * - Correcting tracking number if entered incorrectly
 * - Updating tracking number if shipment is re-routed
 *
 * Note: This does not automatically update order status. Call updateOrderStatus
 * separately to change status to 'shipped' if needed.
 *
 * Performance considerations:
 * - Indexed on orders.id (primary key) for efficient updates
 * - Single atomic update operation
 *
 * @param id - UUID of the order to update
 * @param tracking - Shipping tracking number (format varies by carrier)
 * @returns Promise resolving to updated order or error
 */
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

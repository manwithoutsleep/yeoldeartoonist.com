/**
 * Order Database Functions
 *
 * Database query functions for managing orders and order items.
 * Handles order creation, retrieval, updates, and inventory management.
 */

import { createServiceRoleClient } from '@/lib/supabase/server';
import type { CreateOrderPayload, Order } from '@/types/order';

/**
 * Creates a new order with associated order items.
 *
 * This function:
 * 1. Creates the order record
 * 2. Creates order_items for each cart item
 * 3. Automatically decrements inventory via database trigger
 * 4. Rolls back the order if items creation fails
 *
 * @param payload - Order creation data including customer info, items, and totals
 * @returns Object with data (Order) or error
 *
 * @example
 * ```typescript
 * const { data, error } = await createOrder({
 *   orderNumber: 'ORD-2024-001',
 *   customerName: 'John Doe',
 *   customerEmail: 'john@example.com',
 *   shippingAddress: { line1: '123 Main', city: 'Portland', state: 'OR', zip: '97201', country: 'US' },
 *   billingAddress: { line1: '123 Main', city: 'Portland', state: 'OR', zip: '97201', country: 'US' },
 *   subtotal: 100.00,
 *   shippingCost: 5.00,
 *   taxAmount: 0,
 *   total: 105.00,
 *   paymentIntentId: 'pi_123',
 *   items: [{ artworkId: '123', quantity: 2, priceAtPurchase: 50, lineSubtotal: 100 }]
 * });
 * ```
 */
export async function createOrder(
    payload: CreateOrderPayload
): Promise<{ data: Order | null; error: Error | null }> {
    const supabase = await createServiceRoleClient();

    try {
        // Create order record with flat address fields
        const { data: orderRow, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: payload.orderNumber,
                customer_name: payload.customerName,
                customer_email: payload.customerEmail,
                shipping_address_line1: payload.shippingAddress.line1,
                shipping_address_line2: payload.shippingAddress.line2,
                shipping_city: payload.shippingAddress.city,
                shipping_state: payload.shippingAddress.state,
                shipping_zip: payload.shippingAddress.zip,
                shipping_country: payload.shippingAddress.country,
                billing_address_line1: payload.billingAddress.line1,
                billing_address_line2: payload.billingAddress.line2,
                billing_city: payload.billingAddress.city,
                billing_state: payload.billingAddress.state,
                billing_zip: payload.billingAddress.zip,
                billing_country: payload.billingAddress.country,
                order_notes: payload.orderNotes,
                subtotal: payload.subtotal.toString(),
                shipping_cost: payload.shippingCost.toString(),
                tax_amount: payload.taxAmount.toString(),
                total: payload.total.toString(),
                payment_intent_id: payload.paymentIntentId,
                status: 'pending',
                payment_status: 'pending',
            })
            .select()
            .single();

        if (orderError) {
            return { data: null, error: new Error(orderError.message) };
        }

        // Create order items (prices stored as strings in database)
        const orderItems = payload.items.map((item) => ({
            order_id: orderRow.id,
            artwork_id: item.artworkId,
            quantity: item.quantity,
            price_at_purchase: item.priceAtPurchase.toString(),
            line_subtotal: item.lineSubtotal.toString(),
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            // Rollback order if items fail to insert
            await supabase.from('orders').delete().eq('id', orderRow.id);
            return { data: null, error: new Error(itemsError.message) };
        }

        // Inventory is automatically decremented by database trigger:
        // decrement_artwork_inventory() on order_items insert

        // Convert database row to Order type (camelCase with nested addresses)
        const order: Order = {
            id: orderRow.id,
            orderNumber: orderRow.order_number,
            customerName: orderRow.customer_name,
            customerEmail: orderRow.customer_email,
            shippingAddress: {
                line1: orderRow.shipping_address_line1,
                line2: orderRow.shipping_address_line2 || undefined,
                city: orderRow.shipping_city,
                state: orderRow.shipping_state,
                zip: orderRow.shipping_zip,
                country: orderRow.shipping_country,
            },
            billingAddress: {
                line1: orderRow.billing_address_line1,
                line2: orderRow.billing_address_line2 || undefined,
                city: orderRow.billing_city,
                state: orderRow.billing_state,
                zip: orderRow.billing_zip,
                country: orderRow.billing_country,
            },
            orderNotes: orderRow.order_notes || undefined,
            subtotal: parseFloat(orderRow.subtotal),
            shippingCost: parseFloat(orderRow.shipping_cost),
            taxAmount: parseFloat(orderRow.tax_amount),
            total: parseFloat(orderRow.total),
            status: orderRow.status,
            paymentStatus: orderRow.payment_status,
            paymentIntentId: orderRow.payment_intent_id || undefined,
            shippingTrackingNumber: undefined,
            adminNotes: undefined,
            items: [],
            createdAt: orderRow.created_at,
            updatedAt: orderRow.updated_at,
        };

        return { data: order, error: null };
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err : new Error('Unknown error'),
        };
    }
}

/**
 * Retrieves an order by its ID, including all order items.
 *
 * @param orderId - UUID of the order to retrieve
 * @returns Object with data (Order with items) or error
 *
 * @example
 * ```typescript
 * const { data, error } = await getOrderById('123e4567-e89b-12d3-a456-426614174000');
 * if (data) {
 *   console.log(data.orderNumber); // 'ORD-2024-001'
 *   console.log(data.items.length); // 3
 * }
 * ```
 */
export async function getOrderById(
    orderId: string
): Promise<{ data: Order | null; error: Error | null }> {
    const supabase = await createServiceRoleClient();

    const { data: orderRow, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

    if (error) {
        return { data: null, error: new Error(error.message) };
    }

    // Convert database row to Order type
    const order: Order = {
        id: orderRow.id,
        orderNumber: orderRow.order_number,
        customerName: orderRow.customer_name,
        customerEmail: orderRow.customer_email,
        shippingAddress: {
            line1: orderRow.shipping_address_line1,
            line2: orderRow.shipping_address_line2 || undefined,
            city: orderRow.shipping_city,
            state: orderRow.shipping_state,
            zip: orderRow.shipping_zip,
            country: orderRow.shipping_country,
        },
        billingAddress: {
            line1: orderRow.billing_address_line1,
            line2: orderRow.billing_address_line2 || undefined,
            city: orderRow.billing_city,
            state: orderRow.billing_state,
            zip: orderRow.billing_zip,
            country: orderRow.billing_country,
        },
        orderNotes: orderRow.order_notes || undefined,
        subtotal: parseFloat(orderRow.subtotal),
        shippingCost: parseFloat(orderRow.shipping_cost),
        taxAmount: parseFloat(orderRow.tax_amount),
        total: parseFloat(orderRow.total),
        status: orderRow.status,
        paymentStatus: orderRow.payment_status,
        paymentIntentId: orderRow.payment_intent_id || undefined,
        shippingTrackingNumber: orderRow.shipping_tracking_number || undefined,
        adminNotes: orderRow.admin_notes || undefined,
        items: orderRow.order_items.map(
            (item: {
                id: string;
                order_id: string;
                artwork_id: string;
                quantity: number;
                price_at_purchase: string;
                line_subtotal: string;
                created_at: string;
            }) => ({
                id: item.id,
                artworkId: item.artwork_id,
                quantity: item.quantity,
                priceAtPurchase: parseFloat(item.price_at_purchase),
                lineSubtotal: parseFloat(item.line_subtotal),
            })
        ),
        createdAt: orderRow.created_at,
        updatedAt: orderRow.updated_at,
    };

    return { data: order, error: null };
}

/**
 * Updates the status of an order.
 *
 * @param orderId - UUID of the order to update
 * @param status - New status value (pending, paid, processing, shipped, delivered, cancelled)
 * @returns Object with data (updated Order) or error
 *
 * @example
 * ```typescript
 * const { data, error } = await updateOrderStatus('123e4567-e89b-12d3-a456-426614174000', 'shipped');
 * ```
 */
export async function updateOrderStatus(
    orderId: string,
    status:
        | 'pending'
        | 'paid'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled'
): Promise<{ data: Order | null; error: Error | null }> {
    const supabase = await createServiceRoleClient();

    const { data: orderRow, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        return { data: null, error: new Error(error.message) };
    }

    // Convert database row to Order type
    const order: Order = {
        id: orderRow.id,
        orderNumber: orderRow.order_number,
        customerName: orderRow.customer_name,
        customerEmail: orderRow.customer_email,
        shippingAddress: {
            line1: orderRow.shipping_address_line1,
            line2: orderRow.shipping_address_line2 || undefined,
            city: orderRow.shipping_city,
            state: orderRow.shipping_state,
            zip: orderRow.shipping_zip,
            country: orderRow.shipping_country,
        },
        billingAddress: {
            line1: orderRow.billing_address_line1,
            line2: orderRow.billing_address_line2 || undefined,
            city: orderRow.billing_city,
            state: orderRow.billing_state,
            zip: orderRow.billing_zip,
            country: orderRow.billing_country,
        },
        orderNotes: orderRow.order_notes || undefined,
        subtotal: parseFloat(orderRow.subtotal),
        shippingCost: parseFloat(orderRow.shipping_cost),
        taxAmount: parseFloat(orderRow.tax_amount),
        total: parseFloat(orderRow.total),
        status: orderRow.status,
        paymentStatus: orderRow.payment_status,
        paymentIntentId: orderRow.payment_intent_id || undefined,
        shippingTrackingNumber: orderRow.shipping_tracking_number || undefined,
        adminNotes: orderRow.admin_notes || undefined,
        items: [],
        createdAt: orderRow.created_at,
        updatedAt: orderRow.updated_at,
    };

    return { data: order, error: null };
}

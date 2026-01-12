/**
 * Stripe Checkout Session Retrieval API Route
 *
 * Retrieves checkout session details and associated order.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';
import { Order } from '@/types/order';

type DbOrder = Database['public']['Tables']['orders']['Row'] & {
    order_items: (Database['public']['Tables']['order_items']['Row'] & {
        artwork: {
            title: string;
            image_url: string | null;
        } | null;
    })[];
};

/**
 * Transform database order row to Order type
 * Converts snake_case database fields to camelCase API fields
 */
function transformOrderData(dbOrder: DbOrder): Order {
    return {
        id: dbOrder.id,
        orderNumber: dbOrder.order_number,
        customerName: dbOrder.customer_name,
        customerEmail: dbOrder.customer_email,
        shippingAddress: {
            line1: dbOrder.shipping_address_line1,
            line2: dbOrder.shipping_address_line2 ?? undefined,
            city: dbOrder.shipping_city,
            state: dbOrder.shipping_state,
            zip: dbOrder.shipping_zip,
            country: dbOrder.shipping_country,
        },
        billingAddress: {
            line1: dbOrder.billing_address_line1,
            line2: dbOrder.billing_address_line2 ?? undefined,
            city: dbOrder.billing_city,
            state: dbOrder.billing_state,
            zip: dbOrder.billing_zip,
            country: dbOrder.billing_country,
        },
        orderNotes: dbOrder.order_notes ?? undefined,
        subtotal: parseFloat(dbOrder.subtotal),
        shippingCost: parseFloat(dbOrder.shipping_cost),
        taxAmount: parseFloat(dbOrder.tax_amount),
        total: parseFloat(dbOrder.total),
        status: dbOrder.status,
        paymentStatus: dbOrder.payment_status,
        paymentIntentId: dbOrder.payment_intent_id ?? undefined,
        shippingTrackingNumber: dbOrder.shipping_tracking_number ?? undefined,
        adminNotes: dbOrder.admin_notes ?? undefined,
        items:
            dbOrder.order_items?.map((item) => ({
                id: item.id,
                artworkId: item.artwork_id,
                quantity: item.quantity,
                priceAtPurchase: parseFloat(item.price_at_purchase),
                lineSubtotal: parseFloat(item.line_subtotal),
                title: item.artwork?.title,
                imageUrl: item.artwork?.image_url ?? undefined,
            })) || [],
        createdAt: dbOrder.created_at,
        updatedAt: dbOrder.updated_at,
    };
}

/**
 * GET /api/checkout/session/[sessionId]
 *
 * Retrieves a Stripe Checkout session and its associated order.
 *
 * @param sessionId - Stripe Checkout session ID
 * @returns Order details or error
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Find order by payment_intent_id
        const supabase = await createServiceRoleClient();
        const { data: dbOrder, error } = await supabase
            .from('orders')
            .select(
                `
                *,
                order_items (
                    *,
                    artwork:artwork_id (
                        title,
                        image_url
                    )
                )
            `
            )
            .eq('payment_intent_id', session.payment_intent as string)
            .single();

        if (error || !dbOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Transform database row to Order type (snake_case -> camelCase)
        const order = transformOrderData(dbOrder);

        return NextResponse.json({ order }, { status: 200 });
    } catch (error) {
        console.error('Session retrieval error:', error);
        return NextResponse.json(
            {
                error: 'Failed to retrieve session',
                message:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

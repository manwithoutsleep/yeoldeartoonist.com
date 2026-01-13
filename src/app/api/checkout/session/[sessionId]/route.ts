/**
 * Stripe Checkout Session Retrieval API Route
 *
 * Retrieves checkout session details and associated order.
 */

import { NextRequest, NextResponse } from 'next/server';
import camelcaseKeys from 'camelcase-keys';
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
 * Uses camelcase-keys library to convert snake_case to camelCase
 * Then applies type-specific transformations (numeric strings, nested objects)
 */
function transformOrderData(dbOrder: DbOrder): Order {
    // First, convert all keys to camelCase using the library
    const camelCased = camelcaseKeys(dbOrder, { deep: true }) as {
        id: string;
        orderNumber: string;
        customerName: string;
        customerEmail: string;
        shippingAddressLine1: string;
        shippingAddressLine2: string | null;
        shippingCity: string;
        shippingState: string;
        shippingZip: string;
        shippingCountry: string;
        billingAddressLine1: string;
        billingAddressLine2: string | null;
        billingCity: string;
        billingState: string;
        billingZip: string;
        billingCountry: string;
        orderNotes: string | null;
        subtotal: string;
        shippingCost: string;
        taxAmount: string;
        total: string;
        status: Order['status'];
        paymentStatus: Order['paymentStatus'];
        paymentIntentId: string | null;
        shippingTrackingNumber: string | null;
        adminNotes: string | null;
        orderItems: {
            id: string;
            artworkId: string;
            quantity: number;
            priceAtPurchase: string;
            lineSubtotal: string;
            artwork: {
                title: string;
                imageUrl: string | null;
            } | null;
        }[];
        createdAt: string;
        updatedAt: string;
    };

    // Then apply business logic transformations
    return {
        id: camelCased.id,
        orderNumber: camelCased.orderNumber,
        customerName: camelCased.customerName,
        customerEmail: camelCased.customerEmail,
        shippingAddress: {
            line1: camelCased.shippingAddressLine1,
            line2: camelCased.shippingAddressLine2 ?? undefined,
            city: camelCased.shippingCity,
            state: camelCased.shippingState,
            zip: camelCased.shippingZip,
            country: camelCased.shippingCountry,
        },
        billingAddress: {
            line1: camelCased.billingAddressLine1,
            line2: camelCased.billingAddressLine2 ?? undefined,
            city: camelCased.billingCity,
            state: camelCased.billingState,
            zip: camelCased.billingZip,
            country: camelCased.billingCountry,
        },
        orderNotes: camelCased.orderNotes ?? undefined,
        subtotal: parseFloat(camelCased.subtotal),
        shippingCost: parseFloat(camelCased.shippingCost),
        taxAmount: parseFloat(camelCased.taxAmount),
        total: parseFloat(camelCased.total),
        status: camelCased.status,
        paymentStatus: camelCased.paymentStatus,
        paymentIntentId: camelCased.paymentIntentId ?? undefined,
        shippingTrackingNumber: camelCased.shippingTrackingNumber ?? undefined,
        adminNotes: camelCased.adminNotes ?? undefined,
        items:
            camelCased.orderItems?.map((item) => ({
                id: item.id,
                artworkId: item.artworkId,
                quantity: item.quantity,
                priceAtPurchase: parseFloat(item.priceAtPurchase),
                lineSubtotal: parseFloat(item.lineSubtotal),
                title: item.artwork?.title,
                imageUrl: item.artwork?.imageUrl ?? undefined,
            })) || [],
        createdAt: camelCased.createdAt,
        updatedAt: camelCased.updatedAt,
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
    _request: NextRequest,
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

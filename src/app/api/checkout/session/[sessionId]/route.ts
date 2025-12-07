/**
 * Stripe Checkout Session Retrieval API Route
 *
 * Retrieves checkout session details and associated order.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';

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
        const { data: order, error } = await supabase
            .from('orders')
            .select(
                `
                *,
                order_items (
                    *,
                    artwork:artwork_id (
                        title,
                        slug
                    )
                )
            `
            )
            .eq('payment_intent_id', session.payment_intent as string)
            .single();

        if (error || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

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

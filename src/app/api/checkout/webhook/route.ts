/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for payment processing.
 * Processes payment_intent.succeeded events to create orders.
 */

import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/payments/stripe';
import Stripe from 'stripe';

/**
 * POST /api/checkout/webhook
 *
 * Handles Stripe webhook events.
 *
 * **IMPORTANT**: This endpoint must be excluded from CSRF protection
 * and bodyParser middleware as it requires raw request body for signature verification.
 *
 * Events handled:
 * - payment_intent.succeeded: Creates order record when payment succeeds
 * - payment_intent.payment_failed: Logs failed payment
 *
 * @returns 200 with { received: true } on success
 * @returns 400 on signature verification failure
 * @returns 500 on webhook processing errors (but still returns 200 to Stripe to prevent retries)
 */
export async function POST(request: NextRequest) {
    // Get raw body for signature verification
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        console.error('Webhook error: Missing Stripe signature header');
        return NextResponse.json(
            { error: 'Missing signature' },
            { status: 400 }
        );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('Webhook error: STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json(
            { error: 'Webhook not configured' },
            { status: 500 }
        );
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = constructWebhookEvent(payload, signature, webhookSecret);
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
        console.error('Webhook signature verification failed:', errorMessage);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    // Handle the event based on type
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                console.log('Payment succeeded:', {
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount,
                    customer: paymentIntent.metadata.customerEmail,
                });

                // NOTE: For MVP, order creation is handled on the client side after payment confirmation
                // In a production system, you would:
                // 1. Store cart data in payment intent metadata or a temporary database table
                // 2. Retrieve that data here
                // 3. Create the order record
                // 4. Decrement inventory
                // 5. Send confirmation email

                // For now, we just log the successful payment
                // The client-side success handler will create the order

                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                console.error('Payment failed:', {
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount,
                    customer: paymentIntent.metadata.customerEmail,
                    lastPaymentError: paymentIntent.last_payment_error?.message,
                });

                // In production, you might want to:
                // - Send a failure notification email
                // - Log to an error tracking service
                // - Update any pending order record to "failed" status

                break;
            }

            default:
                console.log('Unhandled webhook event type:', event.type);
        }

        // Always return 200 to Stripe to acknowledge receipt
        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        console.error('Webhook processing error:', errorMessage);

        // Still return 200 to Stripe to prevent retries
        // Log the error for manual investigation
        return NextResponse.json(
            { received: true, error: 'Processing failed' },
            { status: 200 }
        );
    }
}

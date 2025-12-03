/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for payment processing.
 * Processes payment_intent.succeeded events to create orders.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    constructWebhookEvent,
    generateOrderNumber,
} from '@/lib/payments/stripe';
import { createOrder } from '@/lib/db/orders';
import Stripe from 'stripe';
import type { Address } from '@/types/order';

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

                // Create order from payment intent metadata
                try {
                    // Parse metadata
                    const shippingAddress: Address = JSON.parse(
                        paymentIntent.metadata.shippingAddress
                    );
                    const billingAddress: Address = JSON.parse(
                        paymentIntent.metadata.billingAddress
                    );
                    const items: Array<{
                        artworkId: string;
                        quantity: number;
                        price: number;
                    }> = JSON.parse(paymentIntent.metadata.items);

                    // Generate unique order number
                    const orderNumber = generateOrderNumber();

                    // Create order in database with succeeded payment status
                    // This triggers the database trigger to decrement inventory
                    const { data: order, error: orderError } =
                        await createOrder({
                            orderNumber,
                            customerName: paymentIntent.metadata.customerName,
                            customerEmail: paymentIntent.metadata.customerEmail,
                            shippingAddress,
                            billingAddress,
                            orderNotes: paymentIntent.metadata.orderNotes,
                            subtotal: parseFloat(
                                paymentIntent.metadata.subtotal
                            ),
                            shippingCost: parseFloat(
                                paymentIntent.metadata.shippingCost
                            ),
                            taxAmount: parseFloat(
                                paymentIntent.metadata.taxAmount
                            ),
                            total: parseFloat(paymentIntent.metadata.total),
                            paymentIntentId: paymentIntent.id,
                            paymentStatus: 'succeeded',
                            items: items.map((item) => ({
                                artworkId: item.artworkId,
                                quantity: item.quantity,
                                priceAtPurchase: item.price,
                                lineSubtotal: item.price * item.quantity,
                            })),
                        });

                    if (orderError) {
                        console.error('Failed to create order:', orderError);
                        // Log error but don't fail webhook response
                        // Manual intervention may be needed to reconcile payment with order
                    } else {
                        console.log('Order created successfully:', {
                            orderId: order?.id,
                            orderNumber: order?.orderNumber,
                        });

                        // TODO: Send confirmation email (Phase 5)
                        // await sendOrderConfirmationEmail(order);
                    }
                } catch (err) {
                    console.error(
                        'Error processing payment_intent.succeeded:',
                        err
                    );
                    // Log error but don't fail webhook response
                }

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

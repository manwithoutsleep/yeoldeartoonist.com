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
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendOrderEmails } from '@/lib/email/send';
import Stripe from 'stripe';
import type { Address } from '@/types/order';

/**
 * Helper function to extract address from Stripe address object
 */
function extractAddress(address: Stripe.Address | null | undefined): Address {
    return {
        line1: address?.line1 || '',
        line2: address?.line2 || undefined,
        city: address?.city || '',
        state: address?.state || '',
        zip: address?.postal_code || '',
        country: address?.country || 'US',
    };
}

/**
 * POST /api/checkout/webhook
 *
 * Handles Stripe webhook events.
 *
 * **IMPORTANT**: This endpoint must be excluded from CSRF protection
 * and bodyParser middleware as it requires raw request body for signature verification.
 *
 * Events handled:
 * - checkout.session.completed: Creates order from Stripe Checkout session
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

                    // Extract tax amount from automatic_tax (not metadata)
                    // Tax is calculated by Stripe and returned in cents
                    const taxAmountCents =
                        (
                            paymentIntent as Stripe.PaymentIntent & {
                                automatic_tax?: { amount?: number };
                            }
                        ).automatic_tax?.amount ?? 0;
                    const taxAmount = taxAmountCents / 100;

                    // Calculate totals
                    const subtotal = parseFloat(
                        paymentIntent.metadata.subtotal
                    );
                    const shippingCost = parseFloat(
                        paymentIntent.metadata.shippingCost
                    );
                    const total = subtotal + shippingCost + taxAmount;

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
                            subtotal,
                            shippingCost,
                            taxAmount,
                            total,
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

                        // Send order confirmation and admin notification emails
                        // Non-blocking: email failures won't prevent order creation
                        if (order) {
                            const emailResults = await sendOrderEmails(order);
                            if (!emailResults.customer.success) {
                                console.error(
                                    'Failed to send customer confirmation email:',
                                    emailResults.customer.error
                                );
                            }
                            if (!emailResults.admin.success) {
                                console.error(
                                    'Failed to send admin notification email:',
                                    emailResults.admin.error
                                );
                            }
                        }
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

            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session & {
                    shipping_details?: {
                        name?: string;
                        address?: Stripe.Address;
                    };
                };

                console.log('Checkout session completed:', {
                    sessionId: session.id,
                    amount: session.amount_total,
                    customer: session.customer_email,
                });

                // Check for duplicate order using payment_intent_id
                const supabase = await createServiceRoleClient();
                const { data: existingOrder } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('payment_intent_id', session.payment_intent as string)
                    .maybeSingle(); // Use maybeSingle to avoid errors when no order exists

                if (existingOrder) {
                    console.log(
                        'Order already exists for session:',
                        session.id
                    );
                    break;
                }

                // Parse metadata
                const cartItems = JSON.parse(
                    session.metadata?.cartItems || '[]'
                );

                // Extract tax from session
                const taxAmountCents = session.total_details?.amount_tax || 0;
                const taxAmount = taxAmountCents / 100;

                // Extract shipping cost from session
                const shippingCostCents =
                    session.total_details?.amount_shipping || 0;
                const shippingCost = shippingCostCents / 100;

                // Extract addresses using helper
                const shippingAddress = extractAddress(
                    session.shipping_details?.address
                );
                const billingAddress = extractAddress(
                    session.customer_details?.address
                );

                // Calculate totals
                const amountTotal = (session.amount_total || 0) / 100;
                const subtotal = amountTotal - taxAmount - shippingCost;

                // Generate order number
                const orderNumber = generateOrderNumber();

                // Extract customer name with logging for missing data
                const customerName =
                    session.shipping_details?.name ||
                    session.customer_details?.name ||
                    null;

                if (!customerName) {
                    console.error(
                        'Missing customer name in checkout session:',
                        {
                            sessionId: session.id,
                            customerEmail: session.customer_email,
                            shippingDetailsName: session.shipping_details?.name,
                            customerDetailsName: session.customer_details?.name,
                        }
                    );
                }

                // Create order with error handling for duplicate key violation
                const { data: order, error: orderError } = await createOrder({
                    orderNumber,
                    customerName:
                        customerName || `Customer ${session.customer_email}`,
                    customerEmail:
                        session.customer_email ||
                        session.customer_details?.email ||
                        '',
                    shippingAddress,
                    billingAddress,
                    orderNotes: undefined,
                    subtotal,
                    shippingCost,
                    taxAmount,
                    total: amountTotal,
                    paymentIntentId: session.payment_intent as string,
                    paymentStatus: 'succeeded',
                    items: cartItems.map(
                        (item: {
                            artworkId: string;
                            quantity: number;
                            price: number;
                        }) => ({
                            artworkId: item.artworkId,
                            quantity: item.quantity,
                            priceAtPurchase: item.price,
                            lineSubtotal: item.price * item.quantity,
                        })
                    ),
                });

                if (orderError) {
                    // Check if this is a duplicate key error (Postgres error code 23505)
                    // Supabase returns errors with a code property for database constraint violations
                    const errorCode = (orderError as { code?: string }).code;
                    if (
                        errorCode === '23505' &&
                        orderError.message.includes('payment_intent_id')
                    ) {
                        console.log(
                            'Order already created (concurrent webhook):',
                            session.id
                        );
                        break; // Exit gracefully
                    }
                    console.error(
                        'Failed to create order from session:',
                        orderError
                    );
                } else {
                    console.log('Order created from session:', {
                        orderId: order?.id,
                        orderNumber: order?.orderNumber,
                    });

                    // Send order confirmation and admin notification emails
                    // Non-blocking: email failures won't prevent order creation
                    if (order) {
                        const emailResults = await sendOrderEmails(order);
                        if (!emailResults.customer.success) {
                            console.error(
                                'Failed to send customer confirmation email:',
                                emailResults.customer.error
                            );
                        }
                        if (!emailResults.admin.success) {
                            console.error(
                                'Failed to send admin notification email:',
                                emailResults.admin.error
                            );
                        }
                    }
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

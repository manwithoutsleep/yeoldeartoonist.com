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
import { createApiErrorResponse } from '@/lib/errors/user-friendly';
import { logError, logInfo } from '@/lib/errors/logger';

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
        logError(new Error('Missing Stripe signature header'), {
            location: 'api/checkout/webhook',
            action: 'verifySignature',
        });

        return NextResponse.json(createApiErrorResponse('WEBHOOK_ERROR'), {
            status: 400,
        });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        logError(new Error('STRIPE_WEBHOOK_SECRET not configured'), {
            location: 'api/checkout/webhook',
            action: 'getWebhookSecret',
        });

        return NextResponse.json(createApiErrorResponse('WEBHOOK_ERROR'), {
            status: 500,
        });
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = constructWebhookEvent(payload, signature, webhookSecret);
    } catch (err) {
        logError(err, {
            location: 'api/checkout/webhook',
            action: 'constructWebhookEvent',
        });

        return NextResponse.json(createApiErrorResponse('WEBHOOK_ERROR'), {
            status: 400,
        });
    }

    // Handle the event based on type
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                logInfo('Payment succeeded', {
                    location: 'api/checkout/webhook',
                    action: 'handlePaymentIntentSucceeded',
                    metadata: {
                        paymentIntentId: paymentIntent.id,
                        amount: paymentIntent.amount / 100,
                        customer: paymentIntent.metadata.customerEmail,
                    },
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
                        logError(orderError, {
                            location: 'api/checkout/webhook',
                            action: 'createOrderFromPaymentIntent',
                            metadata: { paymentIntentId: paymentIntent.id },
                        });
                        // Log error but don't fail webhook response
                        // Manual intervention may be needed to reconcile payment with order
                    } else {
                        logInfo('Order created successfully', {
                            location: 'api/checkout/webhook',
                            action: 'createOrderFromPaymentIntent',
                            metadata: {
                                orderId: order?.id,
                                orderNumber: order?.orderNumber,
                            },
                        });

                        // Send order confirmation and admin notification emails
                        // Non-blocking: email failures won't prevent order creation
                        if (order) {
                            const emailResults = await sendOrderEmails(order);
                            if (!emailResults.customer.success) {
                                logError(
                                    emailResults.customer.error ||
                                        new Error(
                                            'Failed to send customer confirmation email'
                                        ),
                                    {
                                        location: 'api/checkout/webhook',
                                        action: 'sendCustomerEmail',
                                        metadata: { orderId: order.id },
                                    }
                                );
                            }
                            if (!emailResults.admin.success) {
                                logError(
                                    emailResults.admin.error ||
                                        new Error(
                                            'Failed to send admin notification email'
                                        ),
                                    {
                                        location: 'api/checkout/webhook',
                                        action: 'sendAdminEmail',
                                        metadata: { orderId: order.id },
                                    }
                                );
                            }
                        }
                    }
                } catch (err) {
                    logError(err, {
                        location: 'api/checkout/webhook',
                        action: 'processPaymentIntentSucceeded',
                    });
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

                logInfo('Checkout session completed', {
                    location: 'api/checkout/webhook',
                    action: 'handleCheckoutSessionCompleted',
                    metadata: {
                        sessionId: session.id,
                        amount: session.amount_total,
                        customer: session.customer_email,
                    },
                });

                // Check for duplicate order using payment_intent_id
                const supabase = await createServiceRoleClient();
                const { data: existingOrder } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('payment_intent_id', session.payment_intent as string)
                    .maybeSingle(); // Use maybeSingle to avoid errors when no order exists

                if (existingOrder) {
                    logInfo('Order already exists for session', {
                        location: 'api/checkout/webhook',
                        action: 'checkDuplicateOrder',
                        metadata: { sessionId: session.id },
                    });
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
                    logError(
                        new Error('Missing customer name in checkout session'),
                        {
                            location: 'api/checkout/webhook',
                            action: 'extractCustomerName',
                            metadata: {
                                sessionId: session.id,
                                customerEmail: session.customer_email,
                                shippingDetailsName:
                                    session.shipping_details?.name,
                                customerDetailsName:
                                    session.customer_details?.name,
                            },
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
                        logInfo('Order already created (concurrent webhook)', {
                            location: 'api/checkout/webhook',
                            action: 'handleDuplicateOrder',
                            metadata: { sessionId: session.id },
                        });
                        break; // Exit gracefully
                    }
                    logError(orderError, {
                        location: 'api/checkout/webhook',
                        action: 'createOrderFromSession',
                        metadata: { sessionId: session.id },
                    });
                } else {
                    logInfo('Order created from session', {
                        location: 'api/checkout/webhook',
                        action: 'createOrderFromSession',
                        metadata: {
                            orderId: order?.id,
                            orderNumber: order?.orderNumber,
                        },
                    });

                    // Send order confirmation and admin notification emails
                    // Non-blocking: email failures won't prevent order creation
                    if (order) {
                        const emailResults = await sendOrderEmails(order);
                        if (!emailResults.customer.success) {
                            logError(
                                emailResults.customer.error ||
                                    new Error(
                                        'Failed to send customer confirmation email'
                                    ),
                                {
                                    location: 'api/checkout/webhook',
                                    action: 'sendCustomerEmail',
                                    metadata: { orderId: order.id },
                                }
                            );
                        }
                        if (!emailResults.admin.success) {
                            logError(
                                emailResults.admin.error ||
                                    new Error(
                                        'Failed to send admin notification email'
                                    ),
                                {
                                    location: 'api/checkout/webhook',
                                    action: 'sendAdminEmail',
                                    metadata: { orderId: order.id },
                                }
                            );
                        }
                    }
                }

                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                logError(new Error('Payment failed'), {
                    location: 'api/checkout/webhook',
                    action: 'handlePaymentIntentFailed',
                    metadata: {
                        paymentIntentId: paymentIntent.id,
                        amount: paymentIntent.amount,
                        customer: paymentIntent.metadata.customerEmail,
                        lastPaymentError:
                            paymentIntent.last_payment_error?.message,
                    },
                });

                // In production, you might want to:
                // - Send a failure notification email
                // - Log to an error tracking service
                // - Update any pending order record to "failed" status

                break;
            }

            default:
                logInfo('Unhandled webhook event type', {
                    location: 'api/checkout/webhook',
                    action: 'handleWebhookEvent',
                    metadata: { eventType: event.type },
                });
        }

        // Always return 200 to Stripe to acknowledge receipt
        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        logError(error, {
            location: 'api/checkout/webhook',
            action: 'processWebhook',
        });

        // Still return 200 to Stripe to prevent retries
        // Log the error for manual investigation
        return NextResponse.json(
            { received: true, error: 'Processing failed' },
            { status: 200 }
        );
    }
}

/**
 * Stripe Payment Integration
 *
 * Server-side Stripe client setup and utilities for payment processing.
 * Provides functions for creating payment intents and handling webhook events.
 */

import Stripe from 'stripe';

/**
 * Stripe client instance configured with secret key
 * @throws Error if STRIPE_SECRET_KEY environment variable is not set
 */
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
        'STRIPE_SECRET_KEY environment variable is not set. Please add it to .env.local'
    );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover', // Latest API version
    typescript: true,
});

/**
 * Creates a Stripe payment intent for processing a payment.
 *
 * This function:
 * - Converts dollar amount to cents (Stripe requirement)
 * - Enables automatic payment methods (card, Apple Pay, Google Pay, etc.)
 * - Attaches metadata for order tracking
 *
 * @param amount - Payment amount in dollars (e.g., 105.00)
 * @param currency - ISO currency code (default: 'usd')
 * @param metadata - Additional data to attach to payment intent (customer info, cart data, etc.)
 * @returns Stripe PaymentIntent object with client_secret for client-side confirmation
 *
 * @example
 * ```typescript
 * const paymentIntent = await createPaymentIntent(
 *   105.00,
 *   'usd',
 *   {
 *     customerName: 'John Doe',
 *     customerEmail: 'john@example.com',
 *     orderNumber: 'YOA-20250112-0001'
 *   }
 * );
 * // Use paymentIntent.client_secret on client to confirm payment
 * ```
 */
export async function createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
    // Convert dollars to cents and round to avoid floating point issues
    const amountInCents = Math.round(amount * 100);

    return await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata,
        automatic_payment_methods: {
            enabled: true,
        },
    });
}

/**
 * Constructs and verifies a Stripe webhook event from raw request data.
 *
 * This function:
 * - Verifies the webhook signature to prevent tampering
 * - Parses the webhook payload into a typed Stripe.Event object
 * - Throws an error if signature verification fails
 *
 * @param payload - Raw request body (string or Buffer)
 * @param signature - Stripe signature from 'stripe-signature' header
 * @param webhookSecret - Webhook signing secret from Stripe dashboard or CLI
 * @returns Verified Stripe.Event object
 * @throws Error if signature verification fails
 *
 * @example
 * ```typescript
 * const event = constructWebhookEvent(
 *   requestBody,
 *   request.headers.get('stripe-signature'),
 *   process.env.STRIPE_WEBHOOK_SECRET
 * );
 *
 * switch (event.type) {
 *   case 'payment_intent.succeeded':
 *     // Handle successful payment
 *     break;
 * }
 * ```
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Generates a unique order number with format: YOA-YYYYMMDD-NNNN
 *
 * Format breakdown:
 * - YOA: Ye Olde Artoonist prefix
 * - YYYYMMDD: Current date (e.g., 20250112)
 * - NNNN: Random 4-digit number for uniqueness
 *
 * @returns Formatted order number string
 *
 * @example
 * ```typescript
 * const orderNum = generateOrderNumber();
 * // Returns: 'YOA-20250112-0374'
 * ```
 */
export function generateOrderNumber(): string {
    // Format: YOA-YYYYMMDD-NNNN
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
    return `YOA-${date}-${random}`;
}

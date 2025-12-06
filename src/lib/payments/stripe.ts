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
 * Result type for payment intent creation with tax calculation
 */
export interface PaymentIntentWithTaxResult {
    paymentIntent: Stripe.PaymentIntent;
    taxAmount: number; // In dollars
    total: number; // In dollars
}

/**
 * Creates a Stripe payment intent with automatic tax calculation.
 *
 * This function:
 * - Enables Stripe Tax API for automatic tax calculation
 * - Includes shipping address for tax jurisdiction determination
 * - Returns tax amount and total (subtotal + tax)
 * - Handles cases where tax is not calculated (returns 0)
 *
 * @param amount - Payment amount in dollars before tax (e.g., 105.00)
 * @param shippingAddress - Customer shipping address for tax calculation
 * @param metadata - Additional data to attach to payment intent
 * @returns PaymentIntent with calculated tax amount and total
 *
 * @example
 * ```typescript
 * const result = await createPaymentIntentWithTax(
 *   105.00,
 *   {
 *     line1: '123 Main St',
 *     city: 'Los Angeles',
 *     state: 'CA',
 *     postal_code: '90001',
 *     country: 'US',
 *   },
 *   {
 *     customerName: 'John Doe',
 *     customerEmail: 'john@example.com',
 *   }
 * );
 * // result.taxAmount = 9.19 (calculated by Stripe Tax)
 * // result.total = 114.19
 * ```
 */
export async function createPaymentIntentWithTax(
    amount: number,
    shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    },
    metadata: Record<string, string> = {}
): Promise<PaymentIntentWithTaxResult> {
    // Try to create payment intent with automatic tax first
    // If Stripe Tax is not enabled, fall back to payment intent without tax calculation
    try {
        // Note: automatic_tax is supported by Stripe API but not yet in TypeScript definitions
        // Using type assertion to enable this feature
        const params: Stripe.PaymentIntentCreateParams & {
            automatic_tax?: { enabled: boolean };
        } = {
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
            automatic_tax: {
                enabled: true,
            },
            shipping: {
                name: metadata.customerName || 'Customer',
                address: {
                    line1: shippingAddress.line1,
                    line2: shippingAddress.line2,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postal_code: shippingAddress.postal_code,
                    country: shippingAddress.country,
                },
            },
        };

        const paymentIntent = await stripe.paymentIntents.create(params);

        // Extract tax amount (in cents, convert to dollars)
        // Using type assertion as automatic_tax may not be in current type definitions
        const taxAmountCents =
            (
                paymentIntent as Stripe.PaymentIntent & {
                    automatic_tax?: { amount?: number };
                }
            ).automatic_tax?.amount ?? 0;
        const taxAmount = taxAmountCents / 100;
        const total = amount + taxAmount;

        return {
            paymentIntent,
            taxAmount,
            total,
        };
    } catch (error) {
        // If automatic_tax parameter is not supported, fall back to creating
        // payment intent without tax calculation (tax will be $0)
        if (error instanceof Error && error.message.includes('automatic_tax')) {
            console.warn(
                'Stripe Tax not enabled. Creating payment intent without automatic tax calculation. ' +
                    'To enable tax calculation, activate Stripe Tax in your Stripe Dashboard.'
            );

            // Create payment intent without automatic_tax parameter
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'usd',
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
                shipping: {
                    name: metadata.customerName || 'Customer',
                    address: {
                        line1: shippingAddress.line1,
                        line2: shippingAddress.line2,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        postal_code: shippingAddress.postal_code,
                        country: shippingAddress.country,
                    },
                },
            });

            return {
                paymentIntent,
                taxAmount: 0,
                total: amount,
            };
        }

        // If it's a different error, rethrow it
        throw error;
    }
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

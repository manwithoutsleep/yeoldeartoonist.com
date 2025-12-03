/**
 * CheckoutForm Component
 *
 * Main checkout form that collects customer information, addresses,
 * and integrates with Stripe payment processing.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/hooks/useCart';
import { AddressForm } from './AddressForm';
import { PaymentForm } from './PaymentForm';

/**
 * Zod schema for checkout form validation
 */
const CheckoutSchema = z.object({
    customerName: z.string().min(1, 'Name is required'),
    customerEmail: z.string().email('Invalid email address'),
    shippingAddress: z.object({
        line1: z.string().min(1, 'Address is required'),
        line2: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(2, 'State is required'),
        zip: z.string().min(5, 'ZIP code is required'),
        country: z.string(),
    }),
    useSameAddressForBilling: z.boolean(),
    billingAddress: z
        .object({
            line1: z.string().optional(),
            line2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zip: z.string().optional(),
            country: z.string(),
        })
        .optional(),
    orderNotes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof CheckoutSchema>;

export interface CheckoutFormProps {
    /**
     * Callback when payment intent client secret is received
     */
    onClientSecretReceived: (secret: string) => void;

    /**
     * Callback when an error occurs
     */
    onError: (error: string) => void;

    /**
     * Whether to show the payment form
     */
    showPayment: boolean;
}

/**
 * CheckoutForm orchestrates the checkout process.
 *
 * Features:
 * - Customer information (name, email)
 * - Shipping address with validation
 * - Billing address (optional, can use shipping)
 * - Order notes (optional)
 * - Payment intent creation via API
 * - Payment form integration
 * - Form validation with Zod
 * - Loading states and error handling
 *
 * Flow:
 * 1. User fills out customer info and addresses
 * 2. Form validates on submit
 * 3. Payment intent created via `/api/checkout`
 * 4. Client secret received and passed to parent
 * 5. Payment form displayed for card details
 * 6. Payment confirmed via Stripe
 *
 * @example
 * ```tsx
 * const [clientSecret, setClientSecret] = useState<string>();
 * const [error, setError] = useState<string>();
 *
 * <CheckoutForm
 *   onClientSecretReceived={setClientSecret}
 *   onError={setError}
 * />
 * ```
 */
export function CheckoutForm({
    onClientSecretReceived,
    onError,
    showPayment,
}: CheckoutFormProps) {
    const { cart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(CheckoutSchema),
        defaultValues: {
            useSameAddressForBilling: true,
            shippingAddress: {
                country: 'US',
            },
            billingAddress: {
                country: 'US',
            },
        },
    });

    const useSameAddress = watch('useSameAddressForBilling');

    /**
     * Scroll to top when payment form is shown
     */
    useEffect(() => {
        if (showPayment) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [showPayment]);

    /**
     * Handles form submission and payment intent creation
     */
    const onSubmit = async (data: CheckoutFormData) => {
        setIsSubmitting(true);
        onError('');

        try {
            // Determine billing address (use shipping if checkbox is checked)
            const billingAddress = data.useSameAddressForBilling
                ? data.shippingAddress
                : data.billingAddress;

            // Create payment intent
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.items,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    shippingAddress: data.shippingAddress,
                    billingAddress: billingAddress,
                    orderNotes: data.orderNotes,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error || 'Failed to create payment intent'
                );
            }

            const { clientSecret } = await response.json();
            onClientSecretReceived(clientSecret);
        } catch (err) {
            onError(
                err instanceof Error
                    ? err.message
                    : 'Failed to process checkout'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Handles successful payment
     */
    const handlePaymentSuccess = () => {
        window.location.href = '/shoppe/checkout/success';
    };

    // If showing payment, render only the payment form (no nested forms)
    if (showPayment) {
        return (
            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-bold mb-4">Payment</h2>
                    <PaymentForm
                        onSuccess={handlePaymentSuccess}
                        onError={onError}
                    />
                </section>
            </div>
        );
    }

    // Otherwise, render the checkout form
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Customer Info */}
            <section>
                <h2 className="text-2xl font-bold mb-4">
                    Customer Information
                </h2>
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="customerName"
                            className="block text-sm font-semibold mb-1"
                        >
                            Full Name *
                        </label>
                        <input
                            id="customerName"
                            type="text"
                            {...register('customerName')}
                            className="w-full border-2 border-black rounded px-3 py-2"
                        />
                        {errors.customerName && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.customerName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="customerEmail"
                            className="block text-sm font-semibold mb-1"
                        >
                            Email *
                        </label>
                        <input
                            id="customerEmail"
                            type="email"
                            {...register('customerEmail')}
                            className="w-full border-2 border-black rounded px-3 py-2"
                        />
                        {errors.customerEmail && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.customerEmail.message}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Shipping Address */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
                <AddressForm
                    register={register}
                    errors={errors}
                    prefix="shippingAddress"
                />
            </section>

            {/* Billing Address */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Billing Address</h2>
                <label className="flex items-center gap-2 mb-4">
                    <input
                        type="checkbox"
                        {...register('useSameAddressForBilling')}
                        className="w-4 h-4"
                    />
                    <span className="text-sm">Same as shipping address</span>
                </label>

                {!useSameAddress && (
                    <AddressForm
                        register={register}
                        errors={errors}
                        prefix="billingAddress"
                    />
                )}
            </section>

            {/* Order Notes */}
            <section>
                <h2 className="text-2xl font-bold mb-4">
                    Order Notes (Optional)
                </h2>
                <textarea
                    {...register('orderNotes')}
                    className="w-full border-2 border-black rounded px-3 py-2"
                    rows={4}
                    placeholder="Any special instructions..."
                />
            </section>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </button>
        </form>
    );
}

# Phase 4-05: Checkout Flow Integration

## Parent Specification

This is sub-task 05 of the parent specification: `phase-4-shopping-cart-checkout-00-coordinator.md`

## Objective

Build the complete checkout flow by creating cart and checkout pages, integrating all components from previous tasks, and enabling the "Add to Cart" functionality on the Shoppe page. This task brings all Phase 4 work together into a functional shopping experience.

## Dependencies

**Prerequisites** (must be completed before this task):

- Task 02: Cart UI Components (needs CartButton, CartDrawer, CartItem, CartSummary)
- Task 03: Server Validation & Order Functions (needs validation and order creation)
- Task 04: Stripe Payment Integration (needs payment components and API)

**Blocks** (tasks that depend on this one):

- Task 06: E2E Testing (needs complete checkout flow to test)

**Parallel Opportunities**:

- None - This task integrates all previous work and must be done after Tasks 02, 03, 04

## Scope

### In Scope

- Enable "Add to Cart" button on Shoppe page
- Cart page (`/shoppe/cart`) with full cart management
- Checkout page (`/shoppe/checkout`) with customer form and payment
- Success page (`/shoppe/checkout/success`) showing order confirmation
- Cancelled page (`/shoppe/checkout/cancelled`) for cancelled/failed payments
- Address form component with validation
- Checkout form component integrating address and payment
- Integration of CartContext with all pages
- Integration of validation API with checkout flow
- Integration of Stripe payment with checkout form
- Order creation after successful payment
- Cart clearing after successful checkout
- Error handling and user feedback
- Loading states during async operations
- Responsive design for all pages

### Out of Scope

- Email notifications (Phase 5)
- Order tracking (Phase 5)
- Customer accounts (future)
- Advanced shipping options (MVP uses flat rate)
- Tax calculation UI (handled by Stripe)
- Admin order management (completed in Phase 3)

## Implementation Requirements

### Technology Stack

- Next.js 16 App Router with TypeScript
- React 19 with hooks
- Tailwind CSS 4 for styling
- react-hook-form for form management
- Zod for form validation
- CartContext for state management
- Stripe Elements for payment

### Form Validation

- Use react-hook-form with @hookform/resolvers/zod
- Validate all customer fields (name, email, addresses)
- Real-time validation feedback
- Accessible error messages
- "Same as shipping" toggle for billing address

### Payment Flow

1. User clicks "Proceed to Checkout" from cart
2. Checkout form loads with customer and address fields
3. User fills out form and payment details
4. Form validates on submit
5. Cart validated via API (`/api/checkout/validate`)
6. Payment intent created via API (`/api/checkout`)
7. Stripe confirms payment
8. Webhook creates order and updates status
9. User redirected to success page
10. Cart cleared

## Files to Create/Modify

### New Files

- `src/app/shoppe/cart/page.tsx` - Cart page
- `src/app/shoppe/checkout/page.tsx` - Checkout page
- `src/app/shoppe/checkout/success/page.tsx` - Success page
- `src/app/shoppe/checkout/cancelled/page.tsx` - Cancelled/failed page
- `src/components/checkout/AddressForm.tsx` - Address input fields
- `src/components/checkout/CheckoutForm.tsx` - Main checkout form
- `src/components/shoppe/AddToCartButton.tsx` - Add to cart button component
- `__tests__/app/shoppe/cart/page.test.tsx` - Cart page tests
- `__tests__/app/shoppe/checkout/page.test.tsx` - Checkout page tests
- `__tests__/components/checkout/AddressForm.test.tsx` - Address form tests
- `__tests__/components/checkout/CheckoutForm.test.tsx` - Checkout form tests

### Modified Files

- `src/app/shoppe/page.tsx` - Enable "Add to Cart" functionality
- `src/app/layout.tsx` - Ensure CartProvider wraps app (if not already)

## Testing Requirements

### Cart Page Tests

- [ ] Displays all cart items
- [ ] Shows empty state when cart is empty
- [ ] Quantity controls work
- [ ] Remove button works
- [ ] Cart summary shows correct totals
- [ ] "Continue Shopping" link works
- [ ] "Proceed to Checkout" button works
- [ ] Updates persist to localStorage
- [ ] Responsive on mobile/tablet/desktop

### Checkout Page Tests

- [ ] Form renders with all fields
- [ ] Address validation works
- [ ] Email validation works
- [ ] "Same as shipping" toggle works
- [ ] Payment element renders
- [ ] Form submission validates cart
- [ ] Form submission creates payment intent
- [ ] Form submission confirms payment
- [ ] Loading state during submission
- [ ] Error handling displays messages
- [ ] Redirects to success on payment success
- [ ] Redirects to cancelled on payment failure

### Success Page Tests

- [ ] Displays order confirmation message
- [ ] Shows order number
- [ ] Shows order total
- [ ] Shows shipping address
- [ ] "Return to Shop" link works
- [ ] Cart is cleared

### Cancelled Page Tests

- [ ] Displays cancellation message
- [ ] "Return to Cart" link works
- [ ] "Try Again" button works

### Address Form Tests

- [ ] All fields render
- [ ] Validation works for each field
- [ ] Error messages display
- [ ] Accessible (labels, ARIA)

### Checkout Form Tests

- [ ] Integrates address form
- [ ] Integrates payment form
- [ ] Validates all fields
- [ ] Submits correctly
- [ ] Error handling works

## Success Criteria

- [ ] "Add to Cart" works on Shoppe page
- [ ] Cart page displays and manages cart correctly
- [ ] Checkout page accepts customer info and payment
- [ ] Payment processing works end-to-end
- [ ] Order created in database after payment
- [ ] Inventory decremented after purchase
- [ ] Success page displays order confirmation
- [ ] Cart cleared after successful checkout
- [ ] All pages responsive on mobile/tablet/desktop
- [ ] All forms validate correctly
- [ ] All error states handled gracefully
- [ ] All loading states provide feedback
- [ ] All tests pass
- [ ] Test coverage ≥80% for new pages/components
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code formatted with Prettier
- [ ] The verify-code skill has been successfully executed

## Implementation Notes

### Enable Add to Cart on Shoppe Page

**File**: `src/app/shoppe/page.tsx`

Update the disabled button section:

```tsx
// Before:
<button
    disabled
    className="w-full bg-gray-400 text-white px-4 py-2 rounded font-semibold cursor-not-allowed opacity-50"
    title="Cart functionality coming in Phase 3"
>
    Add to Cart
</button>;

// After:
import { AddToCartButton } from '@/components/shoppe/AddToCartButton';

<AddToCartButton
    artworkId={product.id}
    title={product.title}
    price={product.price}
    slug={product.slug}
    imageUrl={product.image_thumbnail_url}
    maxQuantity={product.inventory_count}
/>;
```

### AddToCartButton Component

**File**: `src/components/shoppe/AddToCartButton.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/types/cart';

interface AddToCartButtonProps {
    artworkId: string;
    title: string;
    price: number;
    slug: string;
    imageUrl?: string;
    maxQuantity: number;
}

export function AddToCartButton({
    artworkId,
    title,
    price,
    slug,
    imageUrl,
    maxQuantity,
}: AddToCartButtonProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addItem } = useCart();

    const handleAddToCart = () => {
        setIsAdding(true);

        const item: CartItem = {
            artworkId,
            title,
            price,
            quantity,
            slug,
            imageUrl,
        };

        addItem(item);

        // Show success feedback
        setTimeout(() => {
            setIsAdding(false);
        }, 500);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">Quantity:</label>
                <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border-2 border-black rounded px-2 py-1 text-black"
                >
                    {Array.from(
                        { length: Math.min(maxQuantity, 10) },
                        (_, i) => i + 1
                    ).map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {isAdding ? 'Added!' : 'Add to Cart'}
            </button>
        </div>
    );
}
```

### Cart Page

**File**: `src/app/shoppe/cart/page.tsx`

```tsx
'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';

export default function CartPage() {
    const { cart, getItemCount } = useCart();

    if (getItemCount() === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Your Cart</h1>
                <p className="text-gray-600 mb-8">Your cart is empty</p>
                <Link
                    href="/shoppe"
                    className="inline-block bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.items.map((item) => (
                        <CartItem key={item.artworkId} item={item} />
                    ))}
                </div>

                {/* Cart Summary */}
                <div className="lg:col-span-1">
                    <CartSummary />
                    <Link
                        href="/shoppe/checkout"
                        className="block w-full bg-black text-white text-center px-6 py-3 rounded font-semibold hover:bg-gray-800 mt-4"
                    >
                        Proceed to Checkout
                    </Link>
                    <Link
                        href="/shoppe"
                        className="block w-full text-center px-6 py-3 mt-2 text-gray-600 hover:text-black"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
```

### Checkout Page

**File**: `src/app/shoppe/checkout/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CartSummary } from '@/components/cart/CartSummary';
import { CheckoutProvider } from '@/components/checkout/CheckoutProvider';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, getItemCount } = useCart();
    const [clientSecret, setClientSecret] = useState<string>();
    const [error, setError] = useState<string>();

    // Redirect if cart is empty
    useEffect(() => {
        if (getItemCount() === 0) {
            router.push('/shoppe/cart');
        }
    }, [getItemCount, router]);

    if (getItemCount() === 0) {
        return null; // Will redirect
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8">Checkout</h1>

            {error && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-8">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2">
                    <CheckoutProvider clientSecret={clientSecret}>
                        <CheckoutForm
                            onClientSecretReceived={setClientSecret}
                            onError={setError}
                        />
                    </CheckoutProvider>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                    <CartSummary />
                </div>
            </div>
        </div>
    );
}
```

### CheckoutForm Component

**File**: `src/components/checkout/CheckoutForm.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/hooks/useCart';
import { AddressForm } from './AddressForm';
import { PaymentForm } from './PaymentForm';

const CheckoutSchema = z.object({
    customerName: z.string().min(1, 'Name is required'),
    customerEmail: z.string().email('Invalid email address'),
    shippingAddress: z.object({
        line1: z.string().min(1, 'Address is required'),
        line2: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(2, 'State is required'),
        zip: z.string().min(5, 'ZIP code is required'),
        country: z.string().default('US'),
    }),
    useSameAddressForBilling: z.boolean().default(true),
    billingAddress: z
        .object({
            line1: z.string().optional(),
            line2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zip: z.string().optional(),
            country: z.string().default('US'),
        })
        .optional(),
    orderNotes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof CheckoutSchema>;

interface CheckoutFormProps {
    onClientSecretReceived: (secret: string) => void;
    onError: (error: string) => void;
}

export function CheckoutForm({
    onClientSecretReceived,
    onError,
}: CheckoutFormProps) {
    const { cart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(CheckoutSchema),
        defaultValues: {
            useSameAddressForBilling: true,
        },
    });

    const useSameAddress = watch('useSameAddressForBilling');

    const onSubmit = async (data: CheckoutFormData) => {
        setIsSubmitting(true);
        setError('');

        try {
            // Create payment intent
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.items,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
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
            setShowPayment(true);
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Customer Info */}
            <section>
                <h2 className="text-2xl font-bold mb-4">
                    Customer Information
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Full Name *
                        </label>
                        <input
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
                        <label className="block text-sm font-semibold mb-1">
                            Email *
                        </label>
                        <input
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

            {/* Payment */}
            {showPayment ? (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Payment</h2>
                    <PaymentForm
                        onSuccess={() => {
                            window.location.href = '/shoppe/checkout/success';
                        }}
                        onError={onError}
                    />
                </section>
            ) : (
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800 disabled:opacity-50"
                >
                    {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                </button>
            )}
        </form>
    );
}
```

### Success Page

**File**: `src/app/shoppe/checkout/success/page.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const paymentIntent = searchParams.get('payment_intent');

    useEffect(() => {
        // Clear cart after successful payment
        clearCart();
    }, [clearCart]);

    return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-8 mb-8">
                <h1 className="text-4xl font-bold text-green-800 mb-4">
                    Order Confirmed!
                </h1>
                <p className="text-lg text-green-700">
                    Thank you for your purchase. Your order has been
                    successfully placed.
                </p>
            </div>

            <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
                <ul className="text-left space-y-2 text-gray-700">
                    <li>
                        ✅ You'll receive an order confirmation email shortly
                    </li>
                    <li>✅ We'll notify you when your order ships</li>
                    <li>✅ Track your order status in your email</li>
                </ul>
            </div>

            <Link
                href="/gallery"
                className="inline-block bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800"
            >
                Return to Gallery
            </Link>
        </div>
    );
}
```

## Notes

- This task requires Tasks 02, 03, and 04 to be completed first
- All pages are client-side rendered due to CartContext dependency
- Form validation uses react-hook-form + Zod for consistency
- Payment flow uses Stripe's recommended redirect approach
- Cart is cleared only after confirmed successful payment
- Success page uses payment_intent query param from Stripe redirect
- Consider adding loading skeletons for better UX
- Ensure all error states provide actionable feedback to users
- Test thoroughly with various cart sizes and edge cases

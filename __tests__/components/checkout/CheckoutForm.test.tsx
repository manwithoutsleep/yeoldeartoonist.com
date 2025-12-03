/**
 * CheckoutForm Component Tests
 *
 * Tests for the main checkout form that collects customer information,
 * addresses, and integrates payment processing.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';

/**
 * Helper function to render components with required providers
 */
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ToastProvider>
            <CartProvider>{ui}</CartProvider>
        </ToastProvider>
    );
};

// Mock fetch
global.fetch = vi.fn();

// Mock useCart
const mockCart = {
    items: [
        {
            artworkId: '1',
            title: 'Test Art',
            price: 29.99,
            quantity: 1,
            slug: 'test-art',
            maxQuantity: 10,
        },
    ],
    lastUpdated: Date.now(),
};

vi.mock('@/hooks/useCart', () => ({
    useCart: () => ({
        cart: mockCart,
        addItem: vi.fn(),
        removeItem: vi.fn(),
        updateQuantity: vi.fn(),
        clearCart: vi.fn(),
        getTotal: vi.fn(() => 29.99),
        getItemCount: vi.fn(() => 1),
    }),
}));

// Mock PaymentForm
vi.mock('@/components/checkout/PaymentForm', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PaymentForm: ({ onSuccess, onError }: any) => (
        <div data-testid="payment-form">
            <button onClick={onSuccess}>Mock Pay</button>
            <button onClick={() => onError('Payment failed')}>
                Mock Error
            </button>
        </div>
    ),
}));

describe('CheckoutForm', () => {
    const mockOnClientSecretReceived = vi.fn();
    const mockOnError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.fetch as any).mockClear();
    });

    it('renders customer information section', () => {
        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        expect(screen.getByText(/customer information/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    });

    it('renders shipping address section', () => {
        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        expect(
            screen.getByRole('heading', { name: /shipping address/i })
        ).toBeInTheDocument();
    });

    it('renders billing address section with same as shipping checkbox', () => {
        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        expect(screen.getByText(/billing address/i)).toBeInTheDocument();
        expect(
            screen.getByLabelText(/same as shipping address/i)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(/same as shipping address/i)
        ).toBeChecked();
    });

    it('shows billing address fields when unchecking same as shipping', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        const checkbox = screen.getByLabelText(/same as shipping address/i);
        await user.click(checkbox);

        expect(checkbox).not.toBeChecked();

        // Should now see billing address fields
        const streetLabels = screen.getAllByText(/street address \*/i);
        expect(streetLabels.length).toBeGreaterThan(1); // One for shipping, one for billing
    });

    it('renders order notes section', () => {
        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        expect(
            screen.getByText(/order notes \(optional\)/i)
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/any special instructions/i)
        ).toBeInTheDocument();
    });

    it('shows continue to payment button initially', () => {
        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        expect(
            screen.getByRole('button', { name: /continue to payment/i })
        ).toBeInTheDocument();
    });

    it('validates required fields on submit', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        const submitButton = screen.getByRole('button', {
            name: /continue to payment/i,
        });
        await user.click(submitButton);

        // Should show validation errors
        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        });
    });

    it('submits form and creates payment intent with valid data', async () => {
        const user = userEvent.setup();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ clientSecret: 'test_secret_123' }),
        });

        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        // Fill in required fields
        await user.type(screen.getByLabelText(/full name/i), 'John Doe');
        await user.type(screen.getByLabelText(/^email/i), 'john@example.com');
        await user.type(
            screen.getByLabelText(/street address/i),
            '123 Main St'
        );
        await user.type(screen.getByLabelText(/^city/i), 'Portland');
        await user.type(screen.getByLabelText(/state/i), 'OR');
        await user.type(screen.getByLabelText(/zip code/i), '97201');

        const submitButton = screen.getByRole('button', {
            name: /continue to payment/i,
        });
        await user.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/checkout',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            // Verify the complete payload
            const callArgs = (global.fetch as Mock).mock.calls[0];
            const body = JSON.parse(callArgs[1].body);

            // Verify customer info
            expect(body.customerName).toBe('John Doe');
            expect(body.customerEmail).toBe('john@example.com');

            // Verify shipping address
            expect(body.shippingAddress).toEqual({
                line1: '123 Main St',
                line2: '',
                city: 'Portland',
                state: 'OR',
                zip: '97201',
                country: 'US',
            });

            // Verify billing address (should be same as shipping when checkbox is checked)
            expect(body.billingAddress).toEqual(body.shippingAddress);

            // Verify items from cart
            expect(body.items).toBeDefined();
        });

        expect(mockOnClientSecretReceived).toHaveBeenCalledWith(
            'test_secret_123'
        );
    });

    it('shows payment form after successful payment intent creation', async () => {
        const user = userEvent.setup();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ clientSecret: 'test_secret_123' }),
        });

        // Create a wrapper that manages showPayment state like the parent component
        function TestWrapper() {
            const [showPayment, setShowPayment] = React.useState(false);

            return (
                <CheckoutForm
                    onClientSecretReceived={(secret) => {
                        mockOnClientSecretReceived(secret);
                        setShowPayment(true);
                    }}
                    onError={mockOnError}
                    showPayment={showPayment}
                />
            );
        }

        renderWithProviders(<TestWrapper />);

        // Fill in required fields
        await user.type(screen.getByLabelText(/full name/i), 'John Doe');
        await user.type(screen.getByLabelText(/^email/i), 'john@example.com');
        await user.type(
            screen.getByLabelText(/street address/i),
            '123 Main St'
        );
        await user.type(screen.getByLabelText(/^city/i), 'Portland');
        await user.type(screen.getByLabelText(/state/i), 'OR');
        await user.type(screen.getByLabelText(/zip code/i), '97201');

        await user.click(
            screen.getByRole('button', { name: /continue to payment/i })
        );

        await waitFor(() => {
            expect(screen.getByTestId('payment-form')).toBeInTheDocument();
        });
    });

    it('handles payment intent creation error', async () => {
        const user = userEvent.setup();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Invalid cart items' }),
        });

        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        // Fill in required fields
        await user.type(screen.getByLabelText(/full name/i), 'John Doe');
        await user.type(screen.getByLabelText(/^email/i), 'john@example.com');
        await user.type(
            screen.getByLabelText(/street address/i),
            '123 Main St'
        );
        await user.type(screen.getByLabelText(/^city/i), 'Portland');
        await user.type(screen.getByLabelText(/state/i), 'OR');
        await user.type(screen.getByLabelText(/zip code/i), '97201');

        await user.click(
            screen.getByRole('button', { name: /continue to payment/i })
        );

        await waitFor(() => {
            expect(mockOnError).toHaveBeenLastCalledWith('Invalid cart items');
        });
    });

    it('shows processing state while submitting', async () => {
        const user = userEvent.setup();

        // Mock a delayed response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.fetch as any).mockImplementationOnce(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                ok: true,
                                json: async () => ({
                                    clientSecret: 'test_secret',
                                }),
                            }),
                        100
                    )
                )
        );

        renderWithProviders(
            <CheckoutForm
                onClientSecretReceived={mockOnClientSecretReceived}
                onError={mockOnError}
                showPayment={false}
            />
        );

        // Fill in required fields
        await user.type(screen.getByLabelText(/full name/i), 'John Doe');
        await user.type(screen.getByLabelText(/^email/i), 'john@example.com');
        await user.type(
            screen.getByLabelText(/street address/i),
            '123 Main St'
        );
        await user.type(screen.getByLabelText(/^city/i), 'Portland');
        await user.type(screen.getByLabelText(/state/i), 'OR');
        await user.type(screen.getByLabelText(/zip code/i), '97201');

        const submitButton = screen.getByRole('button', {
            name: /continue to payment/i,
        });

        // Click and immediately check for processing state (don't await)
        user.click(submitButton);

        // Should show processing state
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /processing/i })
            ).toBeDisabled();
        });
    });
});

/**
 * PaymentForm Component Tests
 *
 * Tests for Stripe Elements payment form component.
 * Tests rendering, submission, error handling, and accessibility.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from '@/components/checkout/PaymentForm';

// Mock Stripe hooks
const mockConfirmPayment = vi.fn();
const mockUseStripe = vi.fn(() => ({
    confirmPayment: mockConfirmPayment,
}));
const mockUseElements = vi.fn(() => ({}));

vi.mock('@stripe/react-stripe-js', () => ({
    useStripe: () => mockUseStripe(),
    useElements: () => mockUseElements(),
    PaymentElement: () => (
        <div data-testid="payment-element">Payment Element</div>
    ),
}));

describe('PaymentForm', () => {
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render payment form', () => {
        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        expect(screen.getByTestId('payment-element')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /pay now/i })
        ).toBeInTheDocument();
    });

    it('should render PaymentElement component', () => {
        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        expect(screen.getByTestId('payment-element')).toBeInTheDocument();
    });

    it('should have submit button enabled when Stripe is loaded', () => {
        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        expect(button).not.toBeDisabled();
    });

    it('should have submit button disabled when Stripe is not loaded', () => {
        mockUseStripe.mockReturnValueOnce(null as never);

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        expect(button).toBeDisabled();
    });

    it('should show processing state during payment', async () => {
        const user = userEvent.setup();

        mockConfirmPayment.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve({ error: null }), 100);
                })
        );

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        expect(
            screen.getByRole('button', { name: /processing/i })
        ).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should call confirmPayment on form submission', async () => {
        const user = userEvent.setup();

        mockConfirmPayment.mockResolvedValueOnce({ error: null });

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        expect(mockConfirmPayment).toHaveBeenCalledWith({
            elements: expect.anything(),
            confirmParams: {
                return_url: expect.stringContaining('/shoppe/checkout/success'),
            },
        });
    });

    it('should call onSuccess when payment succeeds', async () => {
        const user = userEvent.setup();

        mockConfirmPayment.mockResolvedValueOnce({ error: null });

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('should call onError when payment fails', async () => {
        const user = userEvent.setup();

        mockConfirmPayment.mockResolvedValueOnce({
            error: { message: 'Card declined' },
        });

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith('Card declined');
        });
    });

    it('should handle payment errors without message', async () => {
        const user = userEvent.setup();

        mockConfirmPayment.mockResolvedValueOnce({
            error: {}, // No message
        });

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith('Payment failed');
        });
    });

    it('should handle unexpected errors', async () => {
        const user = userEvent.setup();

        mockConfirmPayment.mockRejectedValueOnce(new Error('Network error'));

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith('Network error');
        });
    });

    it('should not submit if Stripe is not loaded', async () => {
        const user = userEvent.setup();

        mockUseStripe.mockReturnValueOnce(null as never);

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        expect(mockConfirmPayment).not.toHaveBeenCalled();
    });

    it('should not submit if Elements is not loaded', async () => {
        const user = userEvent.setup();

        mockUseElements.mockReturnValueOnce(null as never);

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        expect(mockConfirmPayment).not.toHaveBeenCalled();
    });

    it('should have accessible button with aria-busy during processing', async () => {
        const user = userEvent.setup();

        mockConfirmPayment.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve({ error: null }), 100);
                })
        );

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        const processingButton = screen.getByRole('button', {
            name: /processing/i,
        });
        expect(processingButton).toHaveAttribute('aria-busy', 'true');
    });

    it('should reset processing state after error', async () => {
        const user = userEvent.setup();

        mockConfirmPayment.mockResolvedValueOnce({
            error: { message: 'Card declined' },
        });

        render(<PaymentForm onSuccess={mockOnSuccess} onError={mockOnError} />);

        const button = screen.getByRole('button', { name: /pay now/i });
        await user.click(button);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /pay now/i })
            ).toBeInTheDocument();
        });
    });
});

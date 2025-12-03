/**
 * Tests for Toast Component
 *
 * Verifies toast notification display, auto-dismiss, and manual dismiss functionality.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '@/components/Toast';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { describe, it, expect } from 'vitest';

// Test component that allows us to trigger toasts
function ToastTrigger() {
    const { addToast } = useToast();

    return (
        <div>
            <button onClick={() => addToast('Test message', 2000)}>
                Show Toast
            </button>
            <button onClick={() => addToast('Quick message', 500)}>
                Show Quick Toast
            </button>
        </div>
    );
}

describe('Toast', () => {
    it('should not render when there are no toasts', () => {
        render(
            <ToastProvider>
                <Toast />
            </ToastProvider>
        );

        expect(
            screen.queryByRole('region', { name: /notifications/i })
        ).not.toBeInTheDocument();
    });

    it('should display toast when addToast is called', async () => {
        const user = userEvent.setup();

        render(
            <ToastProvider>
                <ToastTrigger />
                <Toast />
            </ToastProvider>
        );

        const button = screen.getByRole('button', { name: /show toast/i });
        await user.click(button);

        expect(screen.getByRole('alert')).toHaveTextContent('Test message');
    });

    it('should auto-dismiss toast after specified duration', async () => {
        const user = userEvent.setup();

        render(
            <ToastProvider>
                <ToastTrigger />
                <Toast />
            </ToastProvider>
        );

        const button = screen.getByRole('button', { name: /show toast/i });
        await user.click(button);

        expect(screen.getByRole('alert')).toHaveTextContent('Test message');

        // Wait for toast to auto-dismiss after 2 seconds
        await waitFor(
            () => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            },
            { timeout: 3000 }
        );
    });

    it('should manually dismiss toast when close button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <ToastProvider>
                <ToastTrigger />
                <Toast />
            </ToastProvider>
        );

        const button = screen.getByRole('button', { name: /show toast/i });
        await user.click(button);

        expect(screen.getByRole('alert')).toHaveTextContent('Test message');

        const closeButton = screen.getByRole('button', {
            name: /close notification/i,
        });
        await user.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('should display multiple toasts simultaneously', async () => {
        const user = userEvent.setup();

        render(
            <ToastProvider>
                <ToastTrigger />
                <Toast />
            </ToastProvider>
        );

        const button1 = screen.getByRole('button', { name: /show toast/i });
        const button2 = screen.getByRole('button', {
            name: /show quick toast/i,
        });

        await user.click(button1);
        await user.click(button2);

        const alerts = screen.getAllByRole('alert');
        expect(alerts).toHaveLength(2);
        expect(alerts[0]).toHaveTextContent('Test message');
        expect(alerts[1]).toHaveTextContent('Quick message');
    });

    it('should dismiss toasts independently', async () => {
        const user = userEvent.setup();

        render(
            <ToastProvider>
                <ToastTrigger />
                <Toast />
            </ToastProvider>
        );

        const button1 = screen.getByRole('button', { name: /show toast/i });
        const button2 = screen.getByRole('button', {
            name: /show quick toast/i,
        });

        await user.click(button1);
        await user.click(button2);

        // Wait for quick toast to auto-dismiss (500ms)
        await waitFor(
            () => {
                const alerts = screen.getAllByRole('alert');
                expect(alerts).toHaveLength(1);
                expect(alerts[0]).toHaveTextContent('Test message');
            },
            { timeout: 1000 }
        );
    });
});

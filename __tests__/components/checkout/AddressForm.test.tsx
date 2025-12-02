/**
 * AddressForm Component Tests
 *
 * Tests for the AddressForm component used in checkout for collecting
 * shipping and billing addresses.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { AddressForm } from '@/components/checkout/AddressForm';

// Test wrapper component to provide form context
function TestWrapper({ prefix = 'shippingAddress' }: { prefix?: string }) {
    const {
        register,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
    });

    return <AddressForm register={register} errors={errors} prefix={prefix} />;
}

describe('AddressForm', () => {
    it('renders all address fields', () => {
        render(<TestWrapper />);

        expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
        expect(
            screen.getByLabelText(/apartment, suite, etc/i)
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/^city/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
    });

    it('marks required fields with asterisk', () => {
        render(<TestWrapper />);

        // Required fields should have asterisk in label
        expect(screen.getByText(/street address \*/i)).toBeInTheDocument();
        expect(screen.getByText(/^city \*/i)).toBeInTheDocument();
        expect(screen.getByText(/state \*/i)).toBeInTheDocument();
        expect(screen.getByText(/zip code \*/i)).toBeInTheDocument();
    });

    it('marks optional field without asterisk', () => {
        render(<TestWrapper />);

        // Optional field should not have asterisk
        const aptLabel = screen.getByText(/apartment, suite, etc/i);
        expect(aptLabel.textContent).not.toContain('*');
    });

    it('uses correct field names with prefix for shipping', () => {
        render(<TestWrapper prefix="shippingAddress" />);

        const streetInput = screen.getByLabelText(/street address/i);
        expect(streetInput).toHaveAttribute('name', 'shippingAddress.line1');
    });

    it('uses correct field names with prefix for billing', () => {
        render(<TestWrapper prefix="billingAddress" />);

        const streetInput = screen.getByLabelText(/street address/i);
        expect(streetInput).toHaveAttribute('name', 'billingAddress.line1');
    });

    it('allows user to enter address information', async () => {
        const user = userEvent.setup();
        render(<TestWrapper />);

        const streetInput = screen.getByLabelText(/street address/i);
        const aptInput = screen.getByLabelText(/apartment, suite, etc/i);
        const cityInput = screen.getByLabelText(/^city/i);
        const stateInput = screen.getByLabelText(/state/i);
        const zipInput = screen.getByLabelText(/zip code/i);

        await user.type(streetInput, '123 Main St');
        await user.type(aptInput, 'Apt 4B');
        await user.type(cityInput, 'Portland');
        await user.type(stateInput, 'OR');
        await user.type(zipInput, '97201');

        expect(streetInput).toHaveValue('123 Main St');
        expect(aptInput).toHaveValue('Apt 4B');
        expect(cityInput).toHaveValue('Portland');
        expect(stateInput).toHaveValue('OR');
        expect(zipInput).toHaveValue('97201');
    });

    it('has proper input types for validation', () => {
        render(<TestWrapper />);

        const zipInput = screen.getByLabelText(/zip code/i);
        expect(zipInput).toHaveAttribute('type', 'text');
    });

    it('renders with accessible labels', () => {
        render(<TestWrapper />);

        // All inputs should be properly associated with labels
        const inputs = screen.getAllByRole('textbox');
        inputs.forEach((input) => {
            expect(input).toHaveAccessibleName();
        });
    });

    it('supports keyboard navigation', () => {
        render(<TestWrapper />);

        const streetInput = screen.getByLabelText(/street address/i);
        const aptInput = screen.getByLabelText(/apartment, suite, etc/i);

        // Both should be focusable
        streetInput.focus();
        expect(streetInput).toHaveFocus();

        aptInput.focus();
        expect(aptInput).toHaveFocus();
    });

    it('displays error messages when provided', () => {
        // Create a wrapper component that uses the hook properly
        function TestWrapperWithError() {
            const { register } = useForm({
                defaultValues: {
                    shippingAddress: {
                        line1: '',
                    },
                },
            });

            // Manually create errors object for testing
            const testErrors = {
                shippingAddress: {
                    line1: {
                        type: 'required',
                        message: 'Street address is required',
                    },
                },
            };

            return (
                <AddressForm
                    register={register}
                    errors={testErrors}
                    prefix="shippingAddress"
                />
            );
        }

        render(<TestWrapperWithError />);

        expect(
            screen.getByText(/street address is required/i)
        ).toBeInTheDocument();
    });
});

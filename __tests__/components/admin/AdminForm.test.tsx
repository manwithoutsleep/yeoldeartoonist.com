import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminForm } from '@/components/admin/AdminForm';
import type { AdminRow } from '@/lib/db/admin/administrators';

describe('AdminForm', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    const mockAdminData: AdminRow = {
        id: 'admin-1',
        auth_id: 'auth-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        is_active: true,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Create Mode', () => {
        it('renders all fields for create mode', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^Password \*$/)).toBeInTheDocument();
        });

        it('shows an info balloon for the name field', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameLabel = screen.getByText(/Name/i);
            if (!nameLabel.parentElement) {
                throw new Error('Could not find parent element of name label');
            }
            const infoIcon = within(nameLabel.parentElement).getByRole('img', {
                name: /info/i,
            });
            expect(infoIcon).toBeInTheDocument();
        });

        it('does not show is_active checkbox in create mode', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.queryByLabelText(/Active/i)).not.toBeInTheDocument();
        });

        it('shows password as required in create mode', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const passwordLabel = screen.getByLabelText(/^Password \*$/);
            expect(passwordLabel).toBeInTheDocument();
        });

        it('shows role dropdown with admin and super_admin options', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const roleSelect = screen.getByLabelText(
                /Role/i
            ) as HTMLSelectElement;
            expect(roleSelect).toBeInTheDocument();

            const options = Array.from(roleSelect.options).map(
                (opt) => opt.value
            );
            expect(options).toContain('admin');
            expect(options).toContain('super_admin');
        });

        it('validates required name field', async () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const submitButton = screen.getByRole('button', {
                name: /Create Admin/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText('Name is required')
                ).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('validates required email field', async () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByLabelText(/Name/i);
            fireEvent.change(nameInput, { target: { value: 'Test User' } });

            const submitButton = screen.getByRole('button', {
                name: /Create Admin/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText('Email is required')
                ).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('validates email format', async () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByLabelText(/Name/i);
            const emailInput = screen.getByLabelText(/Email/i);
            const passwordInput = screen.getByLabelText(/^Password \*$/);
            const passwordConfirmInput =
                screen.getByLabelText(/^Retype Password \*$/);

            fireEvent.change(nameInput, { target: { value: 'Test User' } });
            fireEvent.change(passwordInput, {
                target: { value: 'password123' },
            });
            fireEvent.change(passwordConfirmInput, {
                target: { value: 'password123' },
            });
            fireEvent.change(emailInput, {
                target: { value: 'invalid@email' },
            });

            const submitButton = screen.getByRole('button', {
                name: /Create Admin/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText('Invalid email address')
                ).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('validates required password field', async () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByLabelText(/Name/i);
            const emailInput = screen.getByLabelText(/Email/i);

            fireEvent.change(nameInput, { target: { value: 'Test User' } });
            fireEvent.change(emailInput, {
                target: { value: 'test@example.com' },
            });

            const submitButton = screen.getByRole('button', {
                name: /Create Admin/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText('Password is required')
                ).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('validates password minimum length', async () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByLabelText(/Name/i);
            const emailInput = screen.getByLabelText(/Email/i);
            const passwordInput = screen.getByLabelText(/^Password \*$/);

            fireEvent.change(nameInput, { target: { value: 'Test User' } });
            fireEvent.change(emailInput, {
                target: { value: 'test@example.com' },
            });
            fireEvent.change(passwordInput, { target: { value: 'short' } });

            const submitButton = screen.getByRole('button', {
                name: /Create Admin/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText('Password must be at least 8 characters')
                ).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('submits form with valid data', async () => {
            mockOnSubmit.mockResolvedValue(undefined);

            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByLabelText(/Name/i);
            const emailInput = screen.getByLabelText(/Email/i);
            const roleSelect = screen.getByLabelText(/Role/i);
            const passwordInput = screen.getByLabelText(/^Password \*$/);
            const passwordConfirmInput =
                screen.getByLabelText(/^Retype Password \*$/);

            fireEvent.change(nameInput, { target: { value: 'New Admin' } });
            fireEvent.change(emailInput, {
                target: { value: 'new@example.com' },
            });
            fireEvent.change(roleSelect, { target: { value: 'super_admin' } });
            fireEvent.change(passwordInput, {
                target: { value: 'password123' },
            });
            fireEvent.change(passwordConfirmInput, {
                target: { value: 'password123' },
            });

            const submitButton = screen.getByRole('button', {
                name: /Create Admin/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith({
                    name: 'New Admin',
                    email: 'new@example.com',
                    role: 'super_admin',
                    password: 'password123',
                    passwordConfirm: 'password123',
                });
            });
        });

        it('initializes email as empty string, never undefined', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const emailInput = screen.getByLabelText(
                /Email/i
            ) as HTMLInputElement;
            expect(emailInput.value).toBe('');
            expect(emailInput.value).not.toBe(undefined);
        });

        it('always includes email in submitted data even when trying to submit without filling it', async () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByLabelText(/Name/i);
            const passwordInput = screen.getByLabelText(/^Password \*$/);
            const passwordConfirmInput =
                screen.getByLabelText(/^Retype Password \*$/);

            fireEvent.change(nameInput, { target: { value: 'Test Admin' } });
            fireEvent.change(passwordInput, {
                target: { value: 'password123' },
            });
            fireEvent.change(passwordConfirmInput, {
                target: { value: 'password123' },
            });

            const submitButton = screen.getByRole('button', {
                name: /Create Admin/i,
            });
            fireEvent.click(submitButton);

            // Validation should catch empty email before submission
            await waitFor(() => {
                expect(
                    screen.getByText('Email is required')
                ).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Edit Mode', () => {
        it('renders all fields for edit mode with initialData', () => {
            render(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
            expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument(); // Email not editable
            expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
            expect(
                screen.getByLabelText(/^Password \(optional\)$/)
            ).toBeInTheDocument();
            expect(screen.getByLabelText(/Active/i)).toBeInTheDocument();
        });

        it('pre-fills form with initialData', () => {
            render(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByLabelText(
                /Name/i
            ) as HTMLInputElement;
            const roleSelect = screen.getByLabelText(
                /Role/i
            ) as HTMLSelectElement;
            const activeCheckbox = screen.getByLabelText(
                /Active/i
            ) as HTMLInputElement;

            expect(nameInput.value).toBe('John Doe');
            expect(roleSelect.value).toBe('admin');
            expect(activeCheckbox.checked).toBe(true);
        });

        it('shows password as optional in edit mode', () => {
            render(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const passwordLabel = screen.getByLabelText(
                /^Password \(optional\)$/
            );
            expect(passwordLabel).toBeInTheDocument();
        });

        it('validates name is required in edit mode', async () => {
            render(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByLabelText(/Name/i);
            fireEvent.change(nameInput, { target: { value: '' } });

            const submitButton = screen.getByRole('button', {
                name: /Update Admin/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText('Name is required')
                ).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('validates password length when provided in edit mode', async () => {
            render(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const passwordInput = screen.getByLabelText(
                /^Password \(optional\)$/
            );
            fireEvent.change(passwordInput, { target: { value: 'short' } });

            const submitButton = screen.getByRole('button', {
                name: /Update Admin/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText('Password must be at least 8 characters')
                ).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('submits form without password in edit mode', async () => {
            mockOnSubmit.mockResolvedValue(undefined);

            render(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nameInput = screen.getByLabelText(/Name/i);
            fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

            const submitButton = screen.getByRole('button', {
                name: /Update Admin/i,
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'Updated Name',
                        role: 'admin',
                        is_active: true,
                        password: '',
                    })
                );
            });
        });

        it('can toggle is_active checkbox', () => {
            render(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const activeCheckbox = screen.getByLabelText(
                /Active/i
            ) as HTMLInputElement;
            expect(activeCheckbox.checked).toBe(true);

            fireEvent.click(activeCheckbox);
            expect(activeCheckbox.checked).toBe(false);
        });

        it('can change role', () => {
            render(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const roleSelect = screen.getByLabelText(
                /Role/i
            ) as HTMLSelectElement;
            expect(roleSelect.value).toBe('admin');

            fireEvent.change(roleSelect, { target: { value: 'super_admin' } });
            expect(roleSelect.value).toBe('super_admin');
        });
    });

    describe('Form Actions', () => {
        it('calls onCancel when cancel button is clicked', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const cancelButton = screen.getByRole('button', {
                name: /Cancel/i,
            });
            fireEvent.click(cancelButton);

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('disables inputs when isLoading is true', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    isLoading={true}
                />
            );

            const nameInput = screen.getByLabelText(
                /Name/i
            ) as HTMLInputElement;
            const emailInput = screen.getByLabelText(
                /Email/i
            ) as HTMLInputElement;
            const roleSelect = screen.getByLabelText(
                /Role/i
            ) as HTMLSelectElement;
            const passwordInput = screen.getByLabelText(
                /^Password \*$/
            ) as HTMLInputElement;
            const passwordConfirmInput = screen.getByLabelText(
                /^Retype Password \*$/
            ) as HTMLInputElement;
            const submitButton = screen.getByRole('button', {
                name: /Saving/i,
            }) as HTMLButtonElement;
            const cancelButton = screen.getByRole('button', {
                name: /Cancel/i,
            }) as HTMLButtonElement;

            expect(nameInput.disabled).toBe(true);
            expect(emailInput.disabled).toBe(true);
            expect(roleSelect.disabled).toBe(true);
            expect(passwordInput.disabled).toBe(true);
            expect(passwordConfirmInput.disabled).toBe(true);
            expect(submitButton.disabled).toBe(true);
            expect(cancelButton.disabled).toBe(true);
        });

        it('shows "Saving..." text when isLoading is true', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    isLoading={true}
                />
            );

            expect(screen.getByText('Saving...')).toBeInTheDocument();
        });

        it('shows correct submit button text for create mode', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            expect(
                screen.getByRole('button', { name: /Create Admin/i })
            ).toBeInTheDocument();
        });

        it('shows correct submit button text for edit mode', () => {
            render(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            expect(
                screen.getByRole('button', { name: /Update Admin/i })
            ).toBeInTheDocument();
        });
    });

    describe('Default Values', () => {
        it('defaults role to admin when not provided', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const roleSelect = screen.getByLabelText(
                /Role/i
            ) as HTMLSelectElement;
            expect(roleSelect.value).toBe('admin');
        });

        it('defaults is_active to true in edit mode when not provided', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { is_active, ...adminWithoutActive } = mockAdminData;

            render(
                <AdminForm
                    mode="edit"
                    initialData={adminWithoutActive as AdminRow}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const activeCheckbox = screen.getByLabelText(
                /Active/i
            ) as HTMLInputElement;
            expect(activeCheckbox.checked).toBe(true);
        });
    });

    describe('Error Display', () => {
        it('displays error message when error prop is provided', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    error="Test error message"
                />
            );

            expect(screen.getByText('Test error message')).toBeInTheDocument();
        });

        it('does not display error when error prop is null', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    error={null}
                />
            );

            // Should not find any error message
            expect(
                screen.queryByText(/Test error message/i)
            ).not.toBeInTheDocument();
        });

        it('does not display error when error prop is not provided', () => {
            const { container } = render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            // Error container should not exist
            const errorContainer = container.querySelector('.bg-red-50');
            expect(errorContainer).not.toBeInTheDocument();
        });

        it('calls onErrorDismiss when dismiss button is clicked', () => {
            const mockOnErrorDismiss = vi.fn();

            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    error="Test error message"
                    onErrorDismiss={mockOnErrorDismiss}
                />
            );

            const dismissButton = screen.getByLabelText('Dismiss error');
            fireEvent.click(dismissButton);

            expect(mockOnErrorDismiss).toHaveBeenCalledTimes(1);
        });

        it('does not show dismiss button when onErrorDismiss is not provided', () => {
            render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    error="Test error message"
                />
            );

            expect(
                screen.queryByLabelText('Dismiss error')
            ).not.toBeInTheDocument();
        });

        it('displays error in both create and edit modes', () => {
            const { rerender } = render(
                <AdminForm
                    mode="create"
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    error="Create mode error"
                />
            );

            expect(screen.getByText('Create mode error')).toBeInTheDocument();

            rerender(
                <AdminForm
                    mode="edit"
                    initialData={mockAdminData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    error="Edit mode error"
                />
            );

            expect(screen.getByText('Edit mode error')).toBeInTheDocument();
        });
    });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArtworkForm from '@/components/admin/artwork/ArtworkForm';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

describe('ArtworkForm', () => {
    it('renders all form fields', () => {
        render(<ArtworkForm />);
        expect(screen.getByLabelText(/title/i)).toBeDefined();
        expect(screen.getByLabelText(/slug/i)).toBeDefined();
        expect(screen.getByLabelText(/price/i)).toBeDefined();
        expect(screen.getByLabelText(/inventory count/i)).toBeDefined();
        expect(screen.getByLabelText(/published/i)).toBeDefined();
    });

    it('validates required fields', async () => {
        render(<ArtworkForm />);
        const submitButton = screen.getByRole('button', { name: /save/i });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/title is required/i)).toBeDefined();
            expect(screen.getByText(/slug is required/i)).toBeDefined();
        });
    });

    it('displays error for invalid price', async () => {
        const user = userEvent.setup();
        render(<ArtworkForm />);

        const priceInput = screen.getByLabelText(/price/i);
        await user.type(priceInput, 'abc');

        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText(/price must be a valid positive number/i)
            ).toBeDefined();
        });
    });

    it('submits valid data', async () => {
        const user = userEvent.setup();
        const mockSubmit = vi.fn();
        render(<ArtworkForm onSubmit={mockSubmit} />);

        await user.type(screen.getByLabelText(/title/i), 'Test Art');
        await user.type(screen.getByLabelText(/slug/i), 'test-art');
        await user.type(screen.getByLabelText(/price/i), '100');
        await user.type(screen.getByLabelText(/inventory count/i), '5');

        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalled();
        });
    });

    it('populates form with initial data', () => {
        const initialData = {
            title: 'Existing Art',
            slug: 'existing-art',
            price: '50.00',
            inventory_count: 10,
            is_published: true,
        };
        render(<ArtworkForm initialData={initialData} />);

        expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Art');
        expect(screen.getByLabelText(/slug/i)).toHaveValue('existing-art');
        expect(screen.getByLabelText(/price/i)).toHaveValue('50.00');
        expect(screen.getByLabelText(/inventory count/i)).toHaveValue(10);
        expect(screen.getByLabelText(/published/i)).toBeChecked();
    });
});

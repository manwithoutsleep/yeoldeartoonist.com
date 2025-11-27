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

// Mock Server Action
vi.mock('@/app/admin/actions/upload', () => ({
    uploadImageAction: vi.fn(),
}));

describe('ArtworkForm', () => {
    it('renders all form fields', () => {
        render(<ArtworkForm />);
        expect(screen.getByLabelText(/^title$/i)).toBeDefined();
        expect(screen.getByLabelText(/^slug$/i)).toBeDefined();
        expect(screen.getByLabelText(/^price$/i)).toBeDefined();
        expect(screen.getByLabelText(/inventory count/i)).toBeDefined();
        expect(screen.getByLabelText(/published/i)).toBeDefined();
        // New fields
        expect(screen.getByLabelText(/^sku$/i)).toBeDefined();
        expect(screen.getByLabelText(/original price/i)).toBeDefined();
        expect(screen.getByLabelText(/alt text/i)).toBeDefined();
        expect(screen.getByLabelText(/seo title/i)).toBeDefined();
        expect(screen.getByLabelText(/seo description/i)).toBeDefined();
        expect(screen.getByLabelText(/tags/i)).toBeDefined();
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

        const priceInput = screen.getByLabelText(/^price$/i);
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

        await user.type(screen.getByLabelText(/^title$/i), 'Test Art');
        await user.type(screen.getByLabelText(/^slug$/i), 'test-art');
        await user.type(screen.getByLabelText(/^price$/i), '100');
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

        expect(screen.getByLabelText(/^title$/i)).toHaveValue('Existing Art');
        expect(screen.getByLabelText(/^slug$/i)).toHaveValue('existing-art');
        expect(screen.getByLabelText(/^price$/i)).toHaveValue('50.00');
        expect(screen.getByLabelText(/inventory count/i)).toHaveValue(10);
        expect(screen.getByLabelText(/published/i)).toBeChecked();
    });

    it('populates form with all new fields', () => {
        const initialData = {
            title: 'Test Art',
            slug: 'test-art',
            price: '100.00',
            inventory_count: 5,
            is_published: true,
            sku: 'TEST-001',
            original_price: '150.00',
            alt_text: 'A beautiful test artwork',
            seo_title: 'Test Art - Original Artwork',
            seo_description: 'An amazing piece of test artwork for sale',
            tags: ['test', 'artwork', 'original'],
        };
        render(<ArtworkForm initialData={initialData} />);

        expect(screen.getByLabelText(/^sku$/i)).toHaveValue('TEST-001');
        expect(screen.getByLabelText(/original price/i)).toHaveValue('150.00');
        expect(screen.getByLabelText(/alt text/i)).toHaveValue(
            'A beautiful test artwork'
        );
        expect(screen.getByLabelText(/seo title/i)).toHaveValue(
            'Test Art - Original Artwork'
        );
        expect(screen.getByLabelText(/seo description/i)).toHaveValue(
            'An amazing piece of test artwork for sale'
        );
        expect(screen.getByLabelText(/tags/i)).toHaveValue(
            'test, artwork, original'
        );
    });

    it('converts tags array to comma-separated string', () => {
        const initialData = {
            title: 'Test Art',
            slug: 'test-art',
            price: '100.00',
            tags: ['watercolor', 'landscape', 'nature'],
        };
        render(<ArtworkForm initialData={initialData} />);

        expect(screen.getByLabelText(/tags/i)).toHaveValue(
            'watercolor, landscape, nature'
        );
    });

    it('handles null tags gracefully', () => {
        const initialData = {
            title: 'Test Art',
            slug: 'test-art',
            price: '100.00',
            tags: null,
        };
        render(<ArtworkForm initialData={initialData} />);

        expect(screen.getByLabelText(/tags/i)).toHaveValue('');
    });

    it('converts comma-separated tags to array on submit', async () => {
        const user = userEvent.setup();
        const mockSubmit = vi.fn();
        render(<ArtworkForm onSubmit={mockSubmit} />);

        await user.type(screen.getByLabelText(/^title$/i), 'Test Art');
        await user.type(screen.getByLabelText(/^slug$/i), 'test-art');
        await user.type(screen.getByLabelText(/^price$/i), '100');
        await user.type(
            screen.getByLabelText(/tags/i),
            'watercolor, landscape, nature'
        );

        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: ['watercolor', 'landscape', 'nature'],
                })
            );
        });
    });

    it('handles empty tags string by converting to null', async () => {
        const user = userEvent.setup();
        const mockSubmit = vi.fn();
        render(<ArtworkForm onSubmit={mockSubmit} />);

        await user.type(screen.getByLabelText(/^title$/i), 'Test Art');
        await user.type(screen.getByLabelText(/^slug$/i), 'test-art');
        await user.type(screen.getByLabelText(/^price$/i), '100');
        // Leave tags empty

        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: null,
                })
            );
        });
    });

    it('trims whitespace from individual tags', async () => {
        const user = userEvent.setup();
        const mockSubmit = vi.fn();
        render(<ArtworkForm onSubmit={mockSubmit} />);

        await user.type(screen.getByLabelText(/^title$/i), 'Test Art');
        await user.type(screen.getByLabelText(/^slug$/i), 'test-art');
        await user.type(screen.getByLabelText(/^price$/i), '100');
        await user.type(
            screen.getByLabelText(/tags/i),
            ' watercolor , landscape  ,  nature '
        );

        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: ['watercolor', 'landscape', 'nature'],
                })
            );
        });
    });

    it('renders Cancel button', () => {
        render(<ArtworkForm />);
        expect(
            screen.getByRole('button', { name: /cancel/i })
        ).toBeInTheDocument();
    });

    it('calls router.back when Cancel button is clicked', async () => {
        const mockBack = vi.fn();
        const useRouter = await import('next/navigation');
        vi.spyOn(useRouter, 'useRouter').mockReturnValue({
            push: vi.fn(),
            refresh: vi.fn(),
            back: mockBack,
        } as never);

        render(<ArtworkForm />);
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('renders Back to Artwork List link', () => {
        render(<ArtworkForm />);
        const backLink = screen.getByRole('link', {
            name: /back to artwork list/i,
        });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/admin/artwork');
    });

    it('submits form with existing price data without validation errors', async () => {
        const mockSubmit = vi.fn();
        const initialData = {
            title: 'Test Art',
            slug: 'test-art',
            price: '100.00',
            original_price: '150.00',
            inventory_count: 5,
        };
        render(<ArtworkForm initialData={initialData} onSubmit={mockSubmit} />);

        // Submit immediately without making any changes
        const submitButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalled();
        });

        // Verify price fields were submitted correctly (no validation errors)
        const submitData = mockSubmit.mock.calls[0][0];
        expect(submitData.price).toBe('100.00');
        expect(submitData.original_price).toBe('150.00');
    });

    it('should display uploaded image thumbnail after successful upload', async () => {
        const { uploadImageAction } = await import(
            '@/app/admin/actions/upload'
        );
        (uploadImageAction as ReturnType<typeof vi.fn>).mockResolvedValue({
            success: true,
            data: {
                image_thumbnail_url: 'https://example.com/thumb.webp',
                image_url: 'https://example.com/preview.webp',
                image_large_url: 'https://example.com/large.webp',
            },
        });

        render(<ArtworkForm />);

        // Upload an image
        const file = new File(['image content'], 'test-artwork.jpg', {
            type: 'image/jpeg',
        });
        const fileInput = screen.getByLabelText(/choose image file/i);
        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = await screen.findByRole('button', {
            name: /upload image/i,
        });
        fireEvent.click(uploadButton);

        // Verify thumbnail is displayed after upload
        await waitFor(() => {
            const currentImage = screen.getByAltText(/current image/i);
            expect(currentImage).toBeInTheDocument();
            expect(currentImage).toHaveAttribute(
                'src',
                'https://example.com/preview.webp'
            );
        });
    });
});

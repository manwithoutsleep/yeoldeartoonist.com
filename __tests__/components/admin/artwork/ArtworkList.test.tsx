/**
 * Tests for ArtworkList Component
 *
 * The ArtworkList component displays artwork in a table format with:
 * - Thumbnail images or placeholder
 * - Title, slug, price, and status display
 * - Edit and Delete action buttons
 * - Empty state when no artwork exists
 * - Delete confirmation dialog
 * - Loading state during deletion
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ArtworkList from '@/components/admin/artwork/ArtworkList';
import type { ArtworkRow } from '@/lib/db/admin/artwork';
import { deleteArtworkAction } from '@/app/admin/artwork/actions';

// Mock the deleteArtworkAction
vi.mock('@/app/admin/artwork/actions', () => ({
    deleteArtworkAction: vi.fn(),
}));

const mockDeleteArtworkAction = vi.mocked(deleteArtworkAction);

// Mock window.confirm and window.alert
const mockConfirm = vi.fn();
const mockAlert = vi.fn();

// Sample artwork data for testing
const mockArtwork: ArtworkRow[] = [
    {
        id: '1',
        title: 'Artwork 1',
        slug: 'artwork-1',
        description: 'Description 1',
        image_url: '/img1.jpg',
        image_thumbnail_url: '/thumb1.jpg',
        image_large_url: '/large1.jpg',
        price: '100.00',
        original_price: null,
        sku: 'ART-001',
        inventory_count: 1,
        is_limited_edition: false,
        medium: 'Oil on Canvas',
        dimensions: '10x10',
        year_created: 2023,
        is_published: true,
        is_featured: false,
        display_order: 0,
        alt_text: 'Artwork 1 Alt',
        seo_title: 'Artwork 1 SEO',
        seo_description: 'Artwork 1 SEO Desc',
        tags: ['tag1'],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
    },
    {
        id: '2',
        title: 'Artwork 2',
        slug: 'artwork-2',
        description: 'Description 2',
        image_url: '/img2.jpg',
        image_thumbnail_url: '/thumb2.jpg',
        image_large_url: '/large2.jpg',
        price: '200.50',
        original_price: '250.00',
        sku: 'ART-002',
        inventory_count: 0,
        is_limited_edition: true,
        medium: 'Acrylic',
        dimensions: '20x20',
        year_created: 2023,
        is_published: false,
        is_featured: true,
        display_order: 1,
        alt_text: 'Artwork 2 Alt',
        seo_title: 'Artwork 2 SEO',
        seo_description: 'Artwork 2 SEO Desc',
        tags: ['tag2'],
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
    },
];

describe('ArtworkList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window functions
        global.confirm = mockConfirm;
        global.alert = mockAlert;
        mockConfirm.mockReturnValue(true);
    });

    describe('Core Rendering', () => {
        it('should render artwork list with table structure', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getByText('Image')).toBeInTheDocument();
            expect(screen.getByText('Title')).toBeInTheDocument();
            expect(screen.getByText('Price')).toBeInTheDocument();
            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();
        });

        it('should render all artwork items', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            expect(screen.getByText('Artwork 1')).toBeInTheDocument();
            expect(screen.getByText('Artwork 2')).toBeInTheDocument();
            expect(screen.getByText('artwork-1')).toBeInTheDocument();
            expect(screen.getByText('artwork-2')).toBeInTheDocument();
        });

        it('should render table with correct semantic structure', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const table = screen.getByRole('table');
            expect(table.querySelector('thead')).toBeInTheDocument();
            expect(table.querySelector('tbody')).toBeInTheDocument();
            expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header + 2 data rows
        });

        it('should render with correct column headers', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const columnHeaders = screen.getAllByRole('columnheader');
            expect(columnHeaders).toHaveLength(5);
            expect(columnHeaders[0]).toHaveTextContent('Image');
            expect(columnHeaders[1]).toHaveTextContent('Title');
            expect(columnHeaders[2]).toHaveTextContent('Price');
            expect(columnHeaders[3]).toHaveTextContent('Status');
            expect(columnHeaders[4]).toHaveTextContent('Actions');
        });
    });

    describe('Image Display', () => {
        it('should render thumbnail images when available', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const images = screen.getAllByRole('img');
            expect(images).toHaveLength(2);
            expect(images[0]).toHaveAttribute('alt', 'Artwork 1');
            expect(images[1]).toHaveAttribute('alt', 'Artwork 2');
        });

        it('should display placeholder when no thumbnail available', () => {
            const artworkWithoutImage: ArtworkRow[] = [
                {
                    ...mockArtwork[0],
                    image_thumbnail_url: null,
                },
            ];
            render(<ArtworkList artwork={artworkWithoutImage} />);

            expect(screen.getByText('No Img')).toBeInTheDocument();
        });

        it('should display placeholder when thumbnail is empty string', () => {
            const artworkWithEmptyImage: ArtworkRow[] = [
                {
                    ...mockArtwork[0],
                    image_thumbnail_url: '',
                },
            ];
            render(<ArtworkList artwork={artworkWithEmptyImage} />);

            expect(screen.getByText('No Img')).toBeInTheDocument();
        });

        it('should render placeholder with proper styling', () => {
            const artworkWithoutImage: ArtworkRow[] = [
                {
                    ...mockArtwork[0],
                    image_thumbnail_url: null,
                },
            ];
            render(<ArtworkList artwork={artworkWithoutImage} />);

            const placeholder = screen.getByText('No Img');
            expect(placeholder).toHaveClass('bg-gray-100', 'text-gray-400');
        });
    });

    describe('Title and Slug Display', () => {
        it('should display artwork titles', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            expect(screen.getByText('Artwork 1')).toBeInTheDocument();
            expect(screen.getByText('Artwork 2')).toBeInTheDocument();
        });

        it('should display artwork slugs', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            expect(screen.getByText('artwork-1')).toBeInTheDocument();
            expect(screen.getByText('artwork-2')).toBeInTheDocument();
        });

        it('should style title and slug differently', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const titleElement = screen.getByText('Artwork 1');
            expect(titleElement).toHaveClass('text-gray-900', 'font-medium');

            const slugElement = screen.getByText('artwork-1');
            expect(slugElement).toHaveClass('text-gray-500');
        });

        it('should handle titles with special characters', () => {
            const artworkWithSpecialChars: ArtworkRow[] = [
                {
                    ...mockArtwork[0],
                    title: 'Art & Design: "The Future"',
                    slug: 'art-and-design-the-future',
                },
            ];
            render(<ArtworkList artwork={artworkWithSpecialChars} />);

            expect(
                screen.getByText('Art & Design: "The Future"')
            ).toBeInTheDocument();
            expect(
                screen.getByText('art-and-design-the-future')
            ).toBeInTheDocument();
        });
    });

    describe('Price Display', () => {
        it('should display prices formatted to 2 decimal places', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            expect(screen.getByText('$100.00')).toBeInTheDocument();
            expect(screen.getByText('$200.50')).toBeInTheDocument();
        });

        it('should format integer prices with decimal places', () => {
            const artworkWithIntPrice: ArtworkRow[] = [
                {
                    ...mockArtwork[0],
                    price: '50',
                },
            ];
            render(<ArtworkList artwork={artworkWithIntPrice} />);

            expect(screen.getByText('$50.00')).toBeInTheDocument();
        });

        it('should handle zero price', () => {
            const artworkWithZeroPrice: ArtworkRow[] = [
                {
                    ...mockArtwork[0],
                    price: '0',
                },
            ];
            render(<ArtworkList artwork={artworkWithZeroPrice} />);

            expect(screen.getByText('$0.00')).toBeInTheDocument();
        });

        it('should handle very large prices', () => {
            const artworkWithLargePrice: ArtworkRow[] = [
                {
                    ...mockArtwork[0],
                    price: '999999.99',
                },
            ];
            render(<ArtworkList artwork={artworkWithLargePrice} />);

            expect(screen.getByText('$999999.99')).toBeInTheDocument();
        });
    });

    describe('Status Badge Display', () => {
        it('should show Published badge for published artwork', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const publishedBadge = screen.getByText('Published');
            expect(publishedBadge).toBeInTheDocument();
            expect(publishedBadge).toHaveClass(
                'text-green-800',
                'bg-green-100'
            );
        });

        it('should show Draft badge for unpublished artwork', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const draftBadge = screen.getByText('Draft');
            expect(draftBadge).toBeInTheDocument();
            expect(draftBadge).toHaveClass('text-yellow-800', 'bg-yellow-100');
        });

        it('should display correct number of status badges', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            expect(screen.getByText('Published')).toBeInTheDocument();
            expect(screen.getByText('Draft')).toBeInTheDocument();
        });
    });

    describe('Edit Action Links', () => {
        it('should render Edit links for each artwork', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const editLinks = screen.getAllByText('Edit');
            expect(editLinks).toHaveLength(2);
        });

        it('should have correct href for edit links', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const editLinks = screen.getAllByText('Edit');
            expect(editLinks[0]).toHaveAttribute(
                'href',
                '/admin/artwork/1/edit'
            );
            expect(editLinks[1]).toHaveAttribute(
                'href',
                '/admin/artwork/2/edit'
            );
        });

        it('should style edit links properly', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const editLinks = screen.getAllByText('Edit');
            editLinks.forEach((link) => {
                expect(link).toHaveClass(
                    'text-indigo-600',
                    'hover:text-indigo-900'
                );
            });
        });
    });

    describe('Delete Action Buttons', () => {
        it('should render Delete buttons for each artwork', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButtons = screen.getAllByText('Delete');
            expect(deleteButtons).toHaveLength(2);
        });

        it('should have proper aria-labels for delete buttons', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            expect(
                screen.getByRole('button', { name: 'Delete Artwork 1' })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Delete Artwork 2' })
            ).toBeInTheDocument();
        });

        it('should style delete buttons properly', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButtons = screen.getAllByText('Delete');
            deleteButtons.forEach((button) => {
                expect(button).toHaveClass(
                    'text-red-600',
                    'hover:text-red-900'
                );
            });
        });

        it('should have type="button" on delete buttons', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButtons = screen.getAllByRole('button', {
                name: /Delete/,
            });
            deleteButtons.forEach((button) => {
                expect(button).toHaveAttribute('type', 'button');
            });
        });
    });

    describe('Delete Functionality', () => {
        it('should show confirmation dialog when delete is clicked', async () => {
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            await user.click(deleteButton);

            expect(mockConfirm).toHaveBeenCalledWith(
                'Delete "Artwork 1"? This cannot be undone.'
            );
        });

        it('should not delete if user cancels confirmation', async () => {
            mockConfirm.mockReturnValue(false);
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            await user.click(deleteButton);

            expect(mockConfirm).toHaveBeenCalled();
            expect(mockDeleteArtworkAction).not.toHaveBeenCalled();
        });

        it('should call deleteArtworkAction when user confirms', async () => {
            mockConfirm.mockReturnValue(true);
            mockDeleteArtworkAction.mockResolvedValue(undefined);
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            await user.click(deleteButton);

            await waitFor(() => {
                expect(mockDeleteArtworkAction).toHaveBeenCalledWith('1');
            });
        });

        it('should show "Deleting..." text during deletion', async () => {
            mockConfirm.mockReturnValue(true);
            // Make the delete action hang to test loading state
            mockDeleteArtworkAction.mockImplementation(
                () => new Promise(() => {})
            );
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            await user.click(deleteButton);

            await waitFor(() => {
                expect(screen.getByText('Deleting...')).toBeInTheDocument();
            });
        });

        it('should disable delete button during deletion', async () => {
            mockConfirm.mockReturnValue(true);
            mockDeleteArtworkAction.mockImplementation(
                () => new Promise(() => {})
            );
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            await user.click(deleteButton);

            await waitFor(() => {
                expect(deleteButton).toBeDisabled();
            });
        });

        it('should handle deletion error gracefully', async () => {
            mockConfirm.mockReturnValue(true);
            mockDeleteArtworkAction.mockRejectedValue(
                new Error('Network error')
            );
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            await user.click(deleteButton);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith('Network error');
            });
        });

        it('should handle non-Error deletion failures', async () => {
            mockConfirm.mockReturnValue(true);
            mockDeleteArtworkAction.mockRejectedValue('Unknown error');
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            await user.click(deleteButton);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith(
                    'Failed to delete artwork'
                );
            });
        });

        it('should re-enable button after error', async () => {
            mockConfirm.mockReturnValue(true);
            mockDeleteArtworkAction.mockRejectedValue(new Error('Error'));
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            await user.click(deleteButton);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(deleteButton).not.toBeDisabled();
                expect(deleteButton).toHaveTextContent('Delete');
            });
        });

        it('should only disable the button being deleted', async () => {
            mockConfirm.mockReturnValue(true);
            mockDeleteArtworkAction.mockImplementation(
                () => new Promise(() => {})
            );
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton1 = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            const deleteButton2 = screen.getByRole('button', {
                name: 'Delete Artwork 2',
            });

            await user.click(deleteButton1);

            await waitFor(() => {
                expect(deleteButton1).toBeDisabled();
                expect(deleteButton2).not.toBeDisabled();
            });
        });
    });

    describe('Empty State', () => {
        it('should display empty state when artwork array is empty', () => {
            render(<ArtworkList artwork={[]} />);

            expect(
                screen.getByText(
                    /No artwork found. Create your first artwork to get started./i
                )
            ).toBeInTheDocument();
        });

        it('should not display table in empty state', () => {
            render(<ArtworkList artwork={[]} />);

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('should style empty state properly', () => {
            render(<ArtworkList artwork={[]} />);

            const emptyState = screen.getByText(/No artwork found/i);
            expect(emptyState.parentElement).toHaveClass(
                'p-8',
                'text-center',
                'text-gray-500',
                'bg-white'
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle single artwork item', () => {
            render(<ArtworkList artwork={[mockArtwork[0]]} />);

            expect(screen.getByText('Artwork 1')).toBeInTheDocument();
            expect(screen.queryByText('Artwork 2')).not.toBeInTheDocument();
            expect(screen.getAllByRole('row')).toHaveLength(2); // header + 1 data row
        });

        it('should handle many artwork items', () => {
            const manyArtwork = Array.from({ length: 50 }, (_, i) => ({
                ...mockArtwork[0],
                id: `${i + 1}`,
                title: `Artwork ${i + 1}`,
                slug: `artwork-${i + 1}`,
            }));
            render(<ArtworkList artwork={manyArtwork} />);

            expect(screen.getAllByText(/^Artwork \d+$/)).toHaveLength(50);
            expect(screen.getAllByRole('row')).toHaveLength(51); // header + 50 data rows
        });

        it('should handle artwork with very long titles', () => {
            const artworkWithLongTitle: ArtworkRow[] = [
                {
                    ...mockArtwork[0],
                    title: 'A'.repeat(200),
                },
            ];
            render(<ArtworkList artwork={artworkWithLongTitle} />);

            expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
        });

        it('should handle artwork with unicode characters in title', () => {
            const artworkWithUnicode: ArtworkRow[] = [
                {
                    ...mockArtwork[0],
                    title: '艺术作品 🎨',
                    slug: 'unicode-artwork',
                },
            ];
            render(<ArtworkList artwork={artworkWithUnicode} />);

            expect(screen.getByText('艺术作品 🎨')).toBeInTheDocument();
        });

        it('should handle null artwork prop gracefully', () => {
            // @ts-expect-error Testing edge case
            render(<ArtworkList artwork={null} />);

            expect(screen.getByText(/No artwork found/i)).toBeInTheDocument();
        });

        it('should handle undefined artwork prop gracefully', () => {
            // @ts-expect-error Testing edge case
            render(<ArtworkList artwork={undefined} />);

            expect(screen.getByText(/No artwork found/i)).toBeInTheDocument();
        });
    });

    describe('Table Styling and Layout', () => {
        it('should apply hover effect on table rows', () => {
            const { container } = render(<ArtworkList artwork={mockArtwork} />);

            const rows = container.querySelectorAll('tbody tr');
            rows.forEach((row) => {
                expect(row).toHaveClass('hover:bg-gray-50');
            });
        });

        it('should apply proper spacing to table cells', () => {
            const { container } = render(<ArtworkList artwork={mockArtwork} />);

            const cells = container.querySelectorAll('td');
            cells.forEach((cell) => {
                expect(cell).toHaveClass('px-6', 'py-4');
            });
        });

        it('should have proper table wrapper styling', () => {
            const { container } = render(<ArtworkList artwork={mockArtwork} />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass(
                'overflow-x-auto',
                'bg-white',
                'rounded-lg',
                'border',
                'border-gray-200',
                'shadow-sm'
            );
        });

        it('should render images in consistent size containers', () => {
            const { container } = render(<ArtworkList artwork={mockArtwork} />);

            const imageContainers = container.querySelectorAll(
                'td .relative.w-12.h-12'
            );
            expect(imageContainers.length).toBeGreaterThan(0);
        });
    });

    describe('Accessibility', () => {
        it('should have proper table structure for screen readers', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const table = screen.getByRole('table');
            expect(table.querySelector('thead')).toBeInTheDocument();
            expect(table.querySelector('tbody')).toBeInTheDocument();
        });

        it('should have scope="col" on column headers', () => {
            const { container } = render(<ArtworkList artwork={mockArtwork} />);

            const headers = container.querySelectorAll('th[scope="col"]');
            expect(headers).toHaveLength(5);
        });

        it('should have descriptive aria-labels on delete buttons', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton1 = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            const deleteButton2 = screen.getByRole('button', {
                name: 'Delete Artwork 2',
            });

            expect(deleteButton1).toHaveAttribute(
                'aria-label',
                'Delete Artwork 1'
            );
            expect(deleteButton2).toHaveAttribute(
                'aria-label',
                'Delete Artwork 2'
            );
        });

        it('should have meaningful alt text for images', () => {
            render(<ArtworkList artwork={mockArtwork} />);

            const images = screen.getAllByRole('img');
            expect(images[0]).toHaveAttribute('alt', 'Artwork 1');
            expect(images[1]).toHaveAttribute('alt', 'Artwork 2');
        });

        it('should indicate disabled state on buttons', async () => {
            mockConfirm.mockReturnValue(true);
            mockDeleteArtworkAction.mockImplementation(
                () => new Promise(() => {})
            );
            const user = userEvent.setup();
            render(<ArtworkList artwork={mockArtwork} />);

            const deleteButton = screen.getByRole('button', {
                name: 'Delete Artwork 1',
            });
            await user.click(deleteButton);

            await waitFor(() => {
                expect(deleteButton).toHaveAttribute('disabled');
            });
        });
    });
});

/**
 * Integration Tests for Shoppe Detail Page Flow
 *
 * These tests verify end-to-end user flows for the Shoppe detail page:
 * - Navigation from Shoppe list page to detail page (image, title, View Details)
 * - Lightbox functionality on detail page
 * - Add to Cart functionality from detail page
 * - Back navigation to Shoppe list page
 *
 * This ensures all components work together correctly across the full user journey.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import ShoppePage from '@/app/shoppe/page';
import ShoppeDetailPage from '@/app/shoppe/[slug]/page';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import type { Database } from '@/types/database';

// Mock database query functions
vi.mock('@/lib/db/artwork', () => ({
    getAllArtwork: vi.fn(),
    getArtworkBySlug: vi.fn(),
    getAllArtworkSlugs: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', async () => {
    const actual = await vi.importActual('next/navigation');
    return {
        ...actual,
        notFound: vi.fn(),
        useRouter: vi.fn(() => ({
            push: vi.fn(),
            back: vi.fn(),
        })),
    };
});

// Mock ImageLightbox component
vi.mock('@/components/ui/ImageLightbox', () => ({
    ImageLightbox: ({
        isOpen,
        onClose,
        imageSrc,
        imageAlt,
        imageTitle,
    }: {
        isOpen: boolean;
        onClose: () => void;
        imageSrc: string;
        imageAlt: string;
        imageTitle: string;
    }) => {
        if (!isOpen) return null;
        return (
            <div role="dialog" aria-labelledby="lightbox-title">
                <h2 id="lightbox-title">{imageTitle}</h2>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc} alt={imageAlt} />
                <button onClick={onClose} aria-label="Close lightbox">
                    Close
                </button>
            </div>
        );
    },
}));

import { getAllArtwork, getArtworkBySlug } from '@/lib/db/artwork';

const mockGetAllArtwork = vi.mocked(getAllArtwork);
const mockGetArtworkBySlug = vi.mocked(getArtworkBySlug);

type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

// Mock product for list page
const mockProductListItem: ArtworkRow = {
    id: 'product-123',
    title: 'Medieval Dragon Print',
    description: 'A majestic dragon illustration in medieval style',
    slug: 'medieval-dragon-print',
    image_large_url: '/images/dragon-large.webp',
    image_thumbnail_url: '/images/dragon-thumb.webp',
    image_url: '/images/dragon-preview.webp',
    alt_text: 'Medieval dragon illustration',
    price: '29.99',
    original_price: null,
    sku: 'PRINT-001',
    inventory_count: 10,
    is_limited_edition: false,
    medium: 'Digital Print',
    dimensions: '11 x 14 inches',
    year_created: 2024,
    is_published: true,
    is_featured: false,
    display_order: 1,
    seo_title: null,
    seo_description: null,
    tags: ['dragon', 'medieval', 'fantasy'],
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
};

// Mock product for detail page (same product, full details)
const mockProductDetail: ArtworkRow = mockProductListItem;

/**
 * Helper function to render components with required providers
 */
function renderWithProviders(ui: React.ReactElement) {
    return render(
        <ToastProvider>
            <CartProvider>{ui}</CartProvider>
        </ToastProvider>
    );
}

describe('Shoppe Detail Page Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Navigation from Shoppe List to Detail Page', () => {
        it('should navigate from Shoppe list to detail page when image clicked', async () => {
            // Step 1: Render Shoppe list page with products
            mockGetAllArtwork.mockResolvedValue({
                data: [mockProductListItem],
                error: null,
            });

            const shoppePageResult = await ShoppePage();
            const { unmount: unmountList } =
                renderWithProviders(shoppePageResult);

            // Verify product card is rendered on list page
            expect(
                screen.getByRole('heading', { name: 'Shoppe' })
            ).toBeInTheDocument();
            expect(
                screen.getAllByText('Medieval Dragon Print')[0]
            ).toBeInTheDocument();

            // Find the image link
            const productImage = screen.getByAltText(
                'Medieval dragon illustration'
            );
            const imageLink = productImage.closest('a');
            expect(imageLink).toBeInTheDocument();
            expect(imageLink).toHaveAttribute(
                'href',
                '/shoppe/medieval-dragon-print'
            );
            expect(imageLink).toHaveAttribute(
                'aria-label',
                'View Medieval Dragon Print details'
            );

            // Step 2: Simulate navigation by rendering detail page
            unmountList(); // Clean up list page before rendering detail
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const detailPageResult = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });

            renderWithProviders(detailPageResult);

            // Verify detail page displays product information
            // Use more specific queries to avoid conflicts
            expect(
                screen.getByRole('heading', {
                    name: 'Medieval Dragon Print',
                    level: 1,
                })
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'A majestic dragon illustration in medieval style'
                )
            ).toBeInTheDocument();
            expect(screen.getAllByText('$29.99')[0]).toBeInTheDocument();
        });

        it('should navigate from Shoppe list to detail page when title clicked', async () => {
            // Step 1: Render Shoppe list page
            mockGetAllArtwork.mockResolvedValue({
                data: [mockProductListItem],
                error: null,
            });

            const shoppePageResult = await ShoppePage();
            const { unmount: unmountList } =
                renderWithProviders(shoppePageResult);

            // Find the title link
            const titleHeading = screen.getByRole('heading', {
                name: 'Medieval Dragon Print',
                level: 3,
            });
            const titleLink = titleHeading.closest('a');
            expect(titleLink).toBeInTheDocument();
            expect(titleLink).toHaveAttribute(
                'href',
                '/shoppe/medieval-dragon-print'
            );
            expect(titleLink).toHaveClass('hover:underline');

            // Step 2: Verify navigation would work (link exists with correct href)
            unmountList();
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const detailPageResult = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(detailPageResult);

            expect(
                screen.getByRole('heading', {
                    name: 'Medieval Dragon Print',
                    level: 1,
                })
            ).toBeInTheDocument();
        });

        it('should navigate from Shoppe list to detail page when View Details clicked', async () => {
            // Step 1: Render Shoppe list page
            mockGetAllArtwork.mockResolvedValue({
                data: [mockProductListItem],
                error: null,
            });

            const shoppePageResult = await ShoppePage();
            const { unmount: unmountList } =
                renderWithProviders(shoppePageResult);

            // Find the View Details button
            const viewDetailsButton = screen.getByRole('link', {
                name: /view details/i,
            });
            expect(viewDetailsButton).toBeInTheDocument();
            expect(viewDetailsButton).toHaveAttribute(
                'href',
                '/shoppe/medieval-dragon-print'
            );

            // Step 2: Verify navigation would work
            unmountList();
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const detailPageResult = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(detailPageResult);

            expect(
                screen.getByRole('heading', {
                    name: 'Medieval Dragon Print',
                    level: 1,
                })
            ).toBeInTheDocument();
        });
    });

    describe('Detail Page Content Display', () => {
        it('should display all product information on detail page', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            // Verify title
            expect(
                screen.getByText('Medieval Dragon Print')
            ).toBeInTheDocument();

            // Verify description
            expect(
                screen.getByText(
                    'A majestic dragon illustration in medieval style'
                )
            ).toBeInTheDocument();

            // Verify price
            expect(screen.getByText('$29.99')).toBeInTheDocument();

            // Verify SKU
            expect(screen.getByText(/SKU: PRINT-001/i)).toBeInTheDocument();

            // Verify artwork metadata
            expect(screen.getByText('Digital Print')).toBeInTheDocument();
            expect(screen.getByText('11 x 14 inches')).toBeInTheDocument();
            expect(screen.getByText('2024')).toBeInTheDocument();

            // Verify tags
            expect(screen.getByText('dragon')).toBeInTheDocument();
            expect(screen.getByText('medieval')).toBeInTheDocument();
            expect(screen.getByText('fantasy')).toBeInTheDocument();

            // Verify Add to Cart button exists
            expect(
                screen.getByRole('button', { name: /add to cart/i })
            ).toBeInTheDocument();
        });

        it('should display product image with lightbox trigger', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            // Verify main image is displayed (800px version)
            const image = screen.getByAltText('Medieval dragon illustration');
            expect(image).toBeInTheDocument();
            expect(image.getAttribute('src')).toContain('dragon-preview.webp');

            // Verify lightbox trigger hint
            expect(
                screen.getByText(/click image to enlarge/i)
            ).toBeInTheDocument();

            // Verify image wrapper has proper attributes for interaction
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            expect(imageButton).toBeInTheDocument();
        });
    });

    describe('Lightbox Functionality', () => {
        it('should open lightbox and display full-size image when image clicked', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            const user = userEvent.setup();

            // Find and click the image button
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Verify lightbox opens
            const lightbox = screen.getByRole('dialog');
            expect(lightbox).toBeInTheDocument();

            // Verify lightbox shows the title (can be heading level 1 or 2)
            const lightboxTitle = within(lightbox).getByText(
                'Medieval Dragon Print'
            );
            expect(lightboxTitle).toBeInTheDocument();

            // Verify lightbox shows large image (1600px version)
            // Note: within(lightbox) may not find nested images, so check all images
            const images = screen.getAllByAltText(
                'Medieval dragon illustration'
            );
            const lightboxImage = images.find((img) =>
                img.getAttribute('src')?.includes('dragon-large.webp')
            );
            expect(lightboxImage).toBeInTheDocument();
        });

        it('should open lightbox when Enter key pressed on image', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            const user = userEvent.setup();

            // Find the image button and focus it
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            imageButton.focus();

            // Press Enter key
            await user.keyboard('{Enter}');

            // Verify lightbox opens
            const lightbox = screen.getByRole('dialog');
            expect(lightbox).toBeInTheDocument();
        });

        it('should open lightbox when Space key pressed on image', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            const user = userEvent.setup();

            // Find the image button and focus it
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            imageButton.focus();

            // Press Space key
            await user.keyboard(' ');

            // Verify lightbox opens
            const lightbox = screen.getByRole('dialog');
            expect(lightbox).toBeInTheDocument();
        });

        it('should close lightbox when close button clicked', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            const user = userEvent.setup();

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Verify lightbox is open
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            // Close lightbox
            const closeButton = screen.getByRole('button', {
                name: /close lightbox/i,
            });
            await user.click(closeButton);

            // Verify lightbox is closed
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('Add to Cart Functionality', () => {
        it('should add product to cart from detail page', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            const user = userEvent.setup();

            // Find Add to Cart button
            const addToCartButton = screen.getByRole('button', {
                name: /add to cart/i,
            });
            expect(addToCartButton).toBeInTheDocument();
            expect(addToCartButton).not.toBeDisabled();

            // Click Add to Cart
            await user.click(addToCartButton);

            // Verify button shows "Added!" state temporarily
            expect(
                screen.getByRole('button', { name: /added!/i })
            ).toBeInTheDocument();
        });

        it('should allow quantity selection before adding to cart', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            const user = userEvent.setup();

            // Find quantity select dropdown
            const quantitySelect = screen.getByLabelText(/quantity/i);
            expect(quantitySelect).toBeInTheDocument();
            expect(quantitySelect).toHaveValue('1'); // Default quantity

            // Change quantity using select dropdown
            await user.selectOptions(quantitySelect, '3');
            expect(quantitySelect).toHaveValue('3');

            // Add to cart with updated quantity
            const addToCartButton = screen.getByRole('button', {
                name: /add to cart/i,
            });
            await user.click(addToCartButton);

            // Verify button responds (shows added state)
            expect(
                screen.getByRole('button', { name: /added!/i })
            ).toBeInTheDocument();
        });

        it('should disable Add to Cart when product is out of stock', async () => {
            const outOfStockProduct = {
                ...mockProductDetail,
                inventory_count: 0,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: outOfStockProduct,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            // Verify "Out of Stock" message is displayed
            expect(screen.getByText(/out of stock/i)).toBeInTheDocument();

            // Verify Add to Cart button exists but is disabled
            // Note: AddToCartButton component disables when maxQuantity is 0
            const addToCartButton = screen.getByRole('button', {
                name: /add to cart/i,
            });
            expect(addToCartButton).toBeInTheDocument();
            expect(addToCartButton).toBeDisabled();
        });
    });

    describe('Back Navigation', () => {
        it('should provide back link to Shoppe list page', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            renderWithProviders(result);

            // Find back link
            const backLink = screen.getByRole('link', {
                name: /back to shoppe/i,
            });
            expect(backLink).toBeInTheDocument();
            expect(backLink).toHaveAttribute('href', '/shoppe');
        });

        it('should navigate back to Shoppe list from detail page', async () => {
            // Step 1: Start on detail page
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const detailPageResult = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            const { unmount: unmountDetail } =
                renderWithProviders(detailPageResult);

            // Verify we're on detail page
            expect(
                screen.getByRole('heading', {
                    name: 'Medieval Dragon Print',
                    level: 1,
                })
            ).toBeInTheDocument();

            // Find back link
            const backLink = screen.getByRole('link', {
                name: /back to shoppe/i,
            });
            expect(backLink).toHaveAttribute('href', '/shoppe');

            // Step 2: Simulate navigation back to list page
            unmountDetail();
            mockGetAllArtwork.mockResolvedValue({
                data: [mockProductListItem],
                error: null,
            });

            const shoppePageResult = await ShoppePage();
            renderWithProviders(shoppePageResult);

            // Verify we're back on list page
            expect(
                screen.getByRole('heading', { name: 'Shoppe' })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('heading', {
                    name: 'Medieval Dragon Print',
                    level: 3,
                })
            ).toBeInTheDocument();
            // Verify product card (not detail view)
            expect(
                screen.getByRole('link', { name: /view details/i })
            ).toBeInTheDocument();
        });
    });

    describe('Full User Journey', () => {
        it('should complete full flow: list → detail → lightbox → add to cart → back', async () => {
            const user = userEvent.setup();

            // Step 1: View product on Shoppe list page
            mockGetAllArtwork.mockResolvedValue({
                data: [mockProductListItem],
                error: null,
            });

            const shoppePageResult = await ShoppePage();
            const { unmount: unmountShoppePage } =
                renderWithProviders(shoppePageResult);

            expect(
                screen.getByRole('heading', { name: 'Shoppe' })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('heading', {
                    name: 'Medieval Dragon Print',
                    level: 3,
                })
            ).toBeInTheDocument();

            // Verify navigation links exist
            const viewDetailsButton = screen.getByRole('link', {
                name: /view details/i,
            });
            expect(viewDetailsButton).toHaveAttribute(
                'href',
                '/shoppe/medieval-dragon-print'
            );

            // Step 2: Navigate to detail page
            unmountShoppePage();
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const detailPageResult = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'medieval-dragon-print' }),
            });
            const { unmount: unmountDetailPage } =
                renderWithProviders(detailPageResult);

            expect(
                screen.getByRole('heading', {
                    name: 'Medieval Dragon Print',
                    level: 1,
                })
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'A majestic dragon illustration in medieval style'
                )
            ).toBeInTheDocument();

            // Step 3: Open lightbox to view full-size image
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            expect(screen.getByRole('dialog')).toBeInTheDocument();

            // Step 4: Close lightbox
            const closeButton = screen.getByRole('button', {
                name: /close lightbox/i,
            });
            await user.click(closeButton);

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            // Step 5: Add product to cart
            const addToCartButton = screen.getByRole('button', {
                name: /add to cart/i,
            });
            await user.click(addToCartButton);

            expect(
                screen.getByRole('button', { name: /added!/i })
            ).toBeInTheDocument();

            // Step 6: Navigate back to Shoppe list
            const backLink = screen.getByRole('link', {
                name: /back to shoppe/i,
            });
            expect(backLink).toHaveAttribute('href', '/shoppe');

            unmountDetailPage();
            const shoppePageResult2 = await ShoppePage();
            renderWithProviders(shoppePageResult2);

            expect(
                screen.getByRole('heading', { name: 'Shoppe' })
            ).toBeInTheDocument();
        });
    });

    describe('Error Handling in Integration Flow', () => {
        it('should handle missing product gracefully during navigation', async () => {
            // Attempt to navigate to non-existent product
            // Mock both calls: one for metadata generation, one for page rendering
            mockGetArtworkBySlug.mockResolvedValue({
                data: null,
                error: null,
            });

            const { notFound } = await import('next/navigation');
            const mockNotFound = vi.mocked(notFound);

            // Make notFound() throw to simulate actual behavior
            mockNotFound.mockImplementation(() => {
                throw new Error('NEXT_NOT_FOUND');
            });

            // The page component will call notFound() when artwork is null
            // This should throw, so we catch it
            try {
                await ShoppeDetailPage({
                    params: Promise.resolve({ slug: 'non-existent-product' }),
                });
            } catch {
                // Expected to throw
            }

            // Verify notFound() was called
            expect(mockNotFound).toHaveBeenCalled();
        });

        it('should handle database error gracefully on detail page', async () => {
            // Mock database error
            mockGetArtworkBySlug.mockResolvedValue({
                data: null,
                error: {
                    code: 'ECONNREFUSED',
                    message: 'Database connection failed',
                },
            });

            const { notFound } = await import('next/navigation');
            const mockNotFound = vi.mocked(notFound);

            // Make notFound() throw to simulate actual behavior
            mockNotFound.mockImplementation(() => {
                throw new Error('NEXT_NOT_FOUND');
            });

            // The page component will call notFound() when there's an error
            // This should throw, so we catch it
            try {
                await ShoppeDetailPage({
                    params: Promise.resolve({ slug: 'medieval-dragon-print' }),
                });
            } catch {
                // Expected to throw
            }

            // Verify notFound() was called on error
            expect(mockNotFound).toHaveBeenCalled();
        });
    });
});

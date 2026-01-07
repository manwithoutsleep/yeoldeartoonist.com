/**
 * ProductCard Component Tests
 *
 * Tests for the ProductCard component focusing on navigation and accessibility.
 * These tests verify that product images and titles are clickable and navigate
 * to the detail page at /shoppe/[slug].
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/shoppe/ProductCard';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';

// Helper to wrap components with required providers
function renderWithProviders(component: React.ReactElement) {
    return render(
        <ToastProvider>
            <CartProvider>{component}</CartProvider>
        </ToastProvider>
    );
}

describe('ProductCard', () => {
    const defaultProps = {
        id: 'artwork-123',
        title: 'Test Artwork',
        description: 'A beautiful test artwork',
        price: '29.99',
        originalPrice: null,
        inventoryCount: 10,
        imageThumbnailUrl: 'https://example.com/image.jpg',
        altText: 'Test artwork alt text',
        slug: 'test-artwork',
        headingLevel: 'h2' as const,
    };

    describe('Product Card Navigation', () => {
        it('should wrap image in Link to shoppe detail page', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            // Find the image element
            const image = screen.getByAltText('Test artwork alt text');
            expect(image).toBeInTheDocument();

            // Check that the image is inside a link to /shoppe/test-artwork
            const imageLink = image.closest('a');
            expect(imageLink).toBeInTheDocument();
            expect(imageLink).toHaveAttribute('href', '/shoppe/test-artwork');
        });

        it('should wrap title in Link to shoppe detail page', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            // Find the title heading
            const title = screen.getByRole('heading', { name: 'Test Artwork' });
            expect(title).toBeInTheDocument();

            // Check that the title is inside a link to /shoppe/test-artwork
            const titleLink = title.closest('a');
            expect(titleLink).toBeInTheDocument();
            expect(titleLink).toHaveAttribute('href', '/shoppe/test-artwork');
        });

        it('should preserve existing View Details button functionality', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            // Find the View Details button
            const viewDetailsButton = screen.getByRole('link', {
                name: /view details/i,
            });
            expect(viewDetailsButton).toBeInTheDocument();
            expect(viewDetailsButton).toHaveAttribute(
                'href',
                '/shoppe/test-artwork'
            );
        });

        it('should have accessible link text for image link', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            // Find the image element
            const image = screen.getByAltText('Test artwork alt text');
            const imageLink = image.closest('a');

            // Check that the link has an aria-label for screen readers
            expect(imageLink).toHaveAttribute(
                'aria-label',
                'View Test Artwork details'
            );
        });

        it('should have accessible link text for title link', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            // Find the title heading
            const title = screen.getByRole('heading', { name: 'Test Artwork' });
            const titleLink = title.closest('a');

            // The title link should have hover styling to indicate it's clickable
            expect(titleLink).toHaveClass('hover:underline');
        });

        it('should navigate to /shoppe/[slug] not /gallery/[slug] for View Details', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            // Find the View Details button
            const viewDetailsButton = screen.getByRole('link', {
                name: /view details/i,
            });

            // Verify it points to /shoppe/[slug], not /gallery/[slug]
            expect(viewDetailsButton).toHaveAttribute(
                'href',
                '/shoppe/test-artwork'
            );
            expect(viewDetailsButton).not.toHaveAttribute(
                'href',
                '/gallery/test-artwork'
            );
        });

        it('should use correct slug in all navigation links', () => {
            const customProps = {
                ...defaultProps,
                slug: 'custom-slug-123',
            };
            renderWithProviders(<ProductCard {...customProps} />);

            // Check image link
            const image = screen.getByAltText('Test artwork alt text');
            const imageLink = image.closest('a');
            expect(imageLink).toHaveAttribute(
                'href',
                '/shoppe/custom-slug-123'
            );

            // Check title link
            const title = screen.getByRole('heading', { name: 'Test Artwork' });
            const titleLink = title.closest('a');
            expect(titleLink).toHaveAttribute(
                'href',
                '/shoppe/custom-slug-123'
            );

            // Check View Details link
            const viewDetailsButton = screen.getByRole('link', {
                name: /view details/i,
            });
            expect(viewDetailsButton).toHaveAttribute(
                'href',
                '/shoppe/custom-slug-123'
            );
        });
    });

    describe('Product Card Rendering', () => {
        it('should render product title', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            const title = screen.getByRole('heading', { name: 'Test Artwork' });
            expect(title).toBeInTheDocument();
        });

        it('should render product description', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            expect(
                screen.getByText('A beautiful test artwork')
            ).toBeInTheDocument();
        });

        it('should render product price', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            expect(screen.getByText('$29.99')).toBeInTheDocument();
        });

        it('should render product image when imageThumbnailUrl is provided', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            const image = screen.getByAltText('Test artwork alt text');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute(
                'src',
                expect.stringContaining('example.com')
            );
        });

        it('should display "No image" placeholder when imageThumbnailUrl is null', () => {
            const propsWithoutImage = {
                ...defaultProps,
                imageThumbnailUrl: null,
            };
            renderWithProviders(<ProductCard {...propsWithoutImage} />);

            expect(screen.getByText('No image')).toBeInTheDocument();
        });

        it('should use title as alt text when altText is null', () => {
            const propsWithoutAlt = {
                ...defaultProps,
                altText: null,
            };
            renderWithProviders(<ProductCard {...propsWithoutAlt} />);

            const image = screen.getByAltText('Test Artwork');
            expect(image).toBeInTheDocument();
        });
    });

    describe('Product Card E-commerce Features', () => {
        it('should show low stock warning when inventory is below 5', () => {
            const lowStockProps = {
                ...defaultProps,
                inventoryCount: 3,
            };
            renderWithProviders(<ProductCard {...lowStockProps} />);

            expect(
                screen.getByText('Only 3 left in stock')
            ).toBeInTheDocument();
        });

        it('should not show low stock warning when inventory is 5 or more', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            expect(
                screen.queryByText(/left in stock/i)
            ).not.toBeInTheDocument();
        });

        it('should display original price with strikethrough when on sale', () => {
            const saleProps = {
                ...defaultProps,
                originalPrice: '39.99',
            };
            renderWithProviders(<ProductCard {...saleProps} />);

            const originalPrice = screen.getByText('$39.99');
            expect(originalPrice).toBeInTheDocument();
            expect(originalPrice).toHaveClass('line-through');
        });

        it('should render Add to Cart button', () => {
            renderWithProviders(<ProductCard {...defaultProps} />);

            const addToCartButton = screen.getByRole('button', {
                name: /add to cart/i,
            });
            expect(addToCartButton).toBeInTheDocument();
        });
    });

    describe('Product Card Accessibility', () => {
        it('should use correct heading level when specified', () => {
            const h3Props = {
                ...defaultProps,
                headingLevel: 'h3' as const,
            };
            renderWithProviders(<ProductCard {...h3Props} />);

            const title = screen.getByRole('heading', {
                name: 'Test Artwork',
                level: 3,
            });
            expect(title).toBeInTheDocument();
        });

        it('should default to h2 heading level when not specified', () => {
            const { headingLevel, ...propsWithoutHeadingLevel } = defaultProps;
            renderWithProviders(<ProductCard {...propsWithoutHeadingLevel} />);

            const title = screen.getByRole('heading', {
                name: 'Test Artwork',
                level: 2,
            });
            expect(title).toBeInTheDocument();
        });
    });
});

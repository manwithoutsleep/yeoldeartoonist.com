/**
 * Tests for ShoppeDetailClient Component (TDD Red Phase - Step 8)
 *
 * The ShoppeDetailClient component is a client-side interactive component that:
 * - Displays 800px image in main view (image_url)
 * - Opens lightbox with 1600px image on click (image_large_url)
 * - Provides visual affordances: "Click to enlarge" text hint + zoom icon overlay
 * - Supports keyboard navigation: Enter/Space keys to open lightbox
 * - Ensures accessibility: ARIA attributes, focus indicators, WCAG AA compliant
 *
 * This test file was created in Step 8 (TDD Red Phase) and should FAIL
 * because the ShoppeDetailClient component doesn't exist yet.
 * Step 9 will implement the component to make these tests pass.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Database } from '@/types/database';

// Mock the ImageLightbox component
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

// Import after mocking (this will fail initially since component doesn't exist)

import { ShoppeDetailClient } from '@/app/shoppe/[slug]/ShoppeDetailClient';

type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

const mockArtwork: ArtworkRow = {
    id: '1',
    title: 'Test Product',
    description: 'A test product for sale.',
    slug: 'test-product',
    image_large_url: '/images/test-large.webp', // 1600px
    image_thumbnail_url: '/images/test-thumb.webp', // 300px
    image_url: '/images/test-preview.webp', // 800px
    alt_text: 'Test product image',
    price: '99.99',
    original_price: null,
    sku: 'PROD-001',
    inventory_count: 10,
    is_limited_edition: false,
    medium: 'Canvas Print',
    dimensions: '16 x 20 inches',
    year_created: 2024,
    is_published: true,
    is_featured: false,
    display_order: 1,
    seo_title: null,
    seo_description: null,
    tags: ['print', 'canvas'],
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
};

describe('ShoppeDetailClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Image Display', () => {
        it('should display 800px image (image_url) in main view', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const img = screen.getByAltText(
                'Test product image'
            ) as HTMLImageElement;
            expect(img).toBeInTheDocument();
            // Should use 800px image (image_url), not 1600px (image_large_url)
            expect(img.getAttribute('src')).toContain('test-preview.webp');
            expect(img.getAttribute('src')).not.toContain('test-large.webp');
        });

        it('should have square aspect ratio container', () => {
            const { container } = render(
                <ShoppeDetailClient artwork={mockArtwork} />
            );

            const aspectSquare = container.querySelector('.aspect-square');
            expect(aspectSquare).toBeInTheDocument();
        });

        it('should display "No image available" when image_url is missing', () => {
            const artworkWithoutImage = {
                ...mockArtwork,
                image_url: null,
                image_large_url: null,
            };

            render(<ShoppeDetailClient artwork={artworkWithoutImage} />);

            expect(screen.getByText('No image available')).toBeInTheDocument();
        });

        it('should use alt_text when available', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const img = screen.getByAltText('Test product image');
            expect(img).toBeInTheDocument();
        });

        it('should fallback to title for alt text when alt_text is missing', () => {
            const artworkWithoutAltText = {
                ...mockArtwork,
                alt_text: null,
            };

            render(<ShoppeDetailClient artwork={artworkWithoutAltText} />);

            const img = screen.getByAltText('Test Product');
            expect(img).toBeInTheDocument();
        });
    });

    describe('Visual Affordances', () => {
        it('should display "Click to enlarge" text hint (always visible)', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            expect(
                screen.getByText(/click image to enlarge/i)
            ).toBeInTheDocument();
        });

        it('should not display "Click to enlarge" when image is missing', () => {
            const artworkWithoutImage = {
                ...mockArtwork,
                image_url: null,
            };

            render(<ShoppeDetailClient artwork={artworkWithoutImage} />);

            expect(
                screen.queryByText(/click image to enlarge/i)
            ).not.toBeInTheDocument();
        });

        it('should have cursor-pointer class on image wrapper', () => {
            const { container } = render(
                <ShoppeDetailClient artwork={mockArtwork} />
            );

            const imageWrapper = container.querySelector('.cursor-pointer');
            expect(imageWrapper).toBeInTheDocument();
        });

        it('should have role="button" and tabindex="0" for keyboard accessibility', () => {
            const { container } = render(
                <ShoppeDetailClient artwork={mockArtwork} />
            );

            const imageButton = container.querySelector(
                '[role="button"][tabindex="0"]'
            );
            expect(imageButton).toBeInTheDocument();
        });

        it('should have aria-label for screen readers', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            expect(imageButton).toBeInTheDocument();
        });

        it('should have focus ring styling for keyboard users', () => {
            const { container } = render(
                <ShoppeDetailClient artwork={mockArtwork} />
            );

            const imageButton = container.querySelector('[role="button"]');
            expect(imageButton).toBeInTheDocument();
            // Check for focus ring classes (WCAG AA compliant)
            expect(imageButton?.className).toMatch(/focus:/);
        });

        it('should have zoom icon overlay (magnifying glass SVG)', () => {
            const { container } = render(
                <ShoppeDetailClient artwork={mockArtwork} />
            );

            // Check for SVG magnifying glass icon
            const svgIcon = container.querySelector('svg');
            expect(svgIcon).toBeInTheDocument();
            expect(svgIcon).toHaveAttribute('aria-hidden', 'true');
        });

        it('should have hover opacity transition on overlay', () => {
            const { container } = render(
                <ShoppeDetailClient artwork={mockArtwork} />
            );

            // Check for overlay with opacity transition
            const overlay = container.querySelector(
                '.group-hover\\:opacity-100'
            );
            expect(overlay).toBeInTheDocument();
        });
    });

    describe('Lightbox Interaction', () => {
        it('should open lightbox when image is clicked', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Initially, lightbox should not be visible
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            // Click the image button
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Lightbox should now be open
            const lightbox = await screen.findByRole('dialog');
            expect(lightbox).toBeInTheDocument();
        });

        it('should open lightbox when Enter key is pressed', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Focus the image button
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            imageButton.focus();

            // Press Enter key
            await user.keyboard('{Enter}');

            // Lightbox should open
            const lightbox = await screen.findByRole('dialog');
            expect(lightbox).toBeInTheDocument();
        });

        it('should open lightbox when Space key is pressed', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Focus the image button
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            imageButton.focus();

            // Press Space key
            await user.keyboard(' ');

            // Lightbox should open
            const lightbox = await screen.findByRole('dialog');
            expect(lightbox).toBeInTheDocument();
        });

        it('should pass 1600px image (image_large_url) to lightbox', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Wait for lightbox to appear
            await screen.findByRole('dialog');

            // Check that lightbox uses 1600px image
            const lightboxImg = screen.getAllByAltText(
                'Test product image'
            )[1] as HTMLImageElement; // Second instance is in lightbox
            expect(lightboxImg.getAttribute('src')).toContain(
                'test-large.webp'
            );
        });

        it('should fallback to 800px image in lightbox when image_large_url is missing', async () => {
            const user = userEvent.setup();

            const artworkWithoutLargeImage = {
                ...mockArtwork,
                image_large_url: null,
            };

            render(<ShoppeDetailClient artwork={artworkWithoutLargeImage} />);

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Wait for lightbox
            await screen.findByRole('dialog');

            // Lightbox should fallback to using image_url (800px)
            const lightboxImg = screen.getAllByAltText(
                'Test product image'
            )[1] as HTMLImageElement;
            expect(lightboxImg.getAttribute('src')).toContain(
                'test-preview.webp'
            );
        });

        it('should pass correct alt text to lightbox', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Lightbox should have correct alt text
            await screen.findByRole('dialog');
            const lightboxImages = screen.getAllByAltText('Test product image');
            expect(lightboxImages.length).toBeGreaterThan(1); // Main image + lightbox image
        });

        it('should pass correct title to lightbox', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Lightbox should display title
            await screen.findByRole('dialog');
            const lightboxTitle = screen.getByText('Test Product');
            expect(lightboxTitle).toBeInTheDocument();
        });

        it('should close lightbox when close button is clicked', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Lightbox should be open
            const lightbox = await screen.findByRole('dialog');
            expect(lightbox).toBeInTheDocument();

            // Click close button
            const closeButton = screen.getByRole('button', {
                name: /close lightbox/i,
            });
            await user.click(closeButton);

            // Lightbox should close
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('should not render lightbox when lightbox image URL is missing', () => {
            const artworkWithoutImages = {
                ...mockArtwork,
                image_url: null,
                image_large_url: null,
            };

            const { container } = render(
                <ShoppeDetailClient artwork={artworkWithoutImages} />
            );

            // Lightbox component should not be rendered at all
            expect(
                container.querySelector('[role="dialog"]')
            ).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA label on image button', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            expect(imageButton).toHaveAttribute(
                'aria-label',
                'Click to view full-size image'
            );
        });

        it('should support focus management (tabindex="0")', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            expect(imageButton).toHaveAttribute('tabindex', '0');
        });

        it('should have focus:outline-none with focus ring (WCAG AA)', () => {
            const { container } = render(
                <ShoppeDetailClient artwork={mockArtwork} />
            );

            const imageButton = container.querySelector('[role="button"]');
            expect(imageButton).toBeInTheDocument();
            expect(imageButton?.className).toContain('focus:outline-none');
            expect(imageButton?.className).toMatch(/focus:ring/);
        });

        it('should prevent body scroll when lightbox is open', async () => {
            // Note: This test verifies the ImageLightbox component handles body scroll
            // The ShoppeDetailClient just needs to correctly pass props to ImageLightbox
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Verify lightbox is open (scroll prevention is handled by ImageLightbox)
            const lightbox = await screen.findByRole('dialog');
            expect(lightbox).toBeInTheDocument();
        });

        it('should have descriptive alt text for images', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const img = screen.getByAltText('Test product image');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('alt', 'Test product image');
        });
    });

    describe('Component Structure', () => {
        it('should render image container with proper styling', () => {
            const { container } = render(
                <ShoppeDetailClient artwork={mockArtwork} />
            );

            // Check for image container with border and padding
            const imageContainer = container.querySelector(
                '.border-2.border-black.p-4'
            );
            expect(imageContainer).toBeInTheDocument();
        });

        it('should render within a flex column layout', () => {
            const { container } = render(
                <ShoppeDetailClient artwork={mockArtwork} />
            );

            const flexContainer = container.querySelector(
                '.flex.flex-col.items-center.justify-center'
            );
            expect(flexContainer).toBeInTheDocument();
        });

        it('should use Next.js Image component with fill property', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const img = screen.getByAltText('Test product image');
            expect(img).toBeInTheDocument();
            // Next.js Image with fill renders with specific classes
            expect(img.parentElement).toHaveClass('relative');
        });

        it('should have object-contain class on image for proper scaling', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const img = screen.getByAltText('Test product image');
            expect(img).toHaveClass('object-contain');
        });
    });

    describe('State Management', () => {
        it('should start with lightbox closed', () => {
            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Lightbox should not be visible initially
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('should toggle lightbox state on click', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });

            // Initially closed
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            // Open
            await user.click(imageButton);
            expect(await screen.findByRole('dialog')).toBeInTheDocument();

            // Close
            const closeButton = screen.getByRole('button', {
                name: /close lightbox/i,
            });
            await user.click(closeButton);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle artwork with empty title gracefully', () => {
            const artworkWithEmptyTitle = {
                ...mockArtwork,
                title: '',
            };

            render(<ShoppeDetailClient artwork={artworkWithEmptyTitle} />);

            // Should still render without crashing
            const img = screen.getByAltText('Test product image');
            expect(img).toBeInTheDocument();
        });

        it('should handle artwork with very long title', async () => {
            const user = userEvent.setup();

            const artworkWithLongTitle = {
                ...mockArtwork,
                title: 'A Very Long Product Title That Goes On And On And On For Testing Purposes Only To Ensure Proper Handling Of Edge Cases',
            };

            render(<ShoppeDetailClient artwork={artworkWithLongTitle} />);

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Title should be passed to lightbox
            const lightbox = await screen.findByRole('dialog');
            expect(lightbox).toBeInTheDocument();
        });

        it('should handle rapid clicks without errors', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });

            // Rapid clicks
            await user.click(imageButton);
            await user.click(imageButton);
            await user.click(imageButton);

            // Should still open lightbox correctly
            const lightbox = await screen.findByRole('dialog');
            expect(lightbox).toBeInTheDocument();
        });
    });

    describe('Integration with ImageLightbox', () => {
        it('should pass all required props to ImageLightbox component', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Verify all props are passed correctly
            await screen.findByRole('dialog');
            const lightboxTitle = screen.getByText('Test Product');
            const lightboxImage =
                screen.getAllByAltText('Test product image')[1];

            expect(lightboxTitle).toBeInTheDocument();
            expect(lightboxImage).toBeInTheDocument();
            expect(lightboxImage.getAttribute('src')).toContain(
                'test-large.webp'
            );
        });

        it('should handle ImageLightbox onClose callback', async () => {
            const user = userEvent.setup();

            render(<ShoppeDetailClient artwork={mockArtwork} />);

            // Open lightbox
            const imageButton = screen.getByRole('button', {
                name: /click to view full-size image/i,
            });
            await user.click(imageButton);

            // Close lightbox via close button
            const closeButton = screen.getByRole('button', {
                name: /close lightbox/i,
            });
            await user.click(closeButton);

            // Lightbox should be closed
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});

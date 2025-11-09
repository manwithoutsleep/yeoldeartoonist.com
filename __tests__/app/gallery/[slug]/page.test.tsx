/**
 * Tests for Gallery Detail Page ([slug])
 *
 * The gallery detail page is a server component that:
 * - Displays a single artwork with full details
 * - Shows large image with fallback to standard image
 * - Displays metadata (medium, dimensions, year created, tags)
 * - Handles missing artworks with notFound()
 * - Uses static generation with ISR
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GalleryDetailPage from '@/app/gallery/[slug]/page';
import { notFound } from 'next/navigation';

// Mock the database query functions
vi.mock('@/lib/db/artwork', () => ({
    getArtworkBySlug: vi.fn(),
    getAllArtworkSlugs: vi.fn(),
}));

// Mock next/navigation (extends the global mock to add notFound)
vi.mock('next/navigation', async () => {
    const actual = await vi.importActual('next/navigation');
    return {
        ...actual,
        notFound: vi.fn(),
    };
});

import { getArtworkBySlug, getAllArtworkSlugs } from '@/lib/db/artwork';
import { Database } from '@/types/database';

const mockGetArtworkBySlug = vi.mocked(getArtworkBySlug);
const mockGetAllArtworkSlugs = vi.mocked(getAllArtworkSlugs);
const mockNotFound = vi.mocked(notFound);

type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

const mockArtworkDetail: ArtworkRow = {
    id: '1',
    title: 'Sunset Over Mountains',
    description: 'A breathtaking landscape capturing the golden hour light.',
    slug: 'sunset-over-mountains',
    image_large_url: '/images/sunset-large.webp',
    image_thumbnail_url: '/images/sunset-thumb.webp',
    image_url: '/images/sunset.webp',
    alt_text: 'Sunset over mountain range',
    price: '199.99',
    original_price: null,
    sku: 'ART-001',
    inventory_count: 5,
    is_limited_edition: false,
    medium: 'Oil on Canvas',
    dimensions: '24 x 36 inches',
    year_created: 2023,
    is_published: true,
    is_featured: true,
    display_order: 1,
    seo_title: null,
    seo_description: null,
    tags: ['landscape', 'nature', 'sunset'],
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
};

describe('Gallery Detail Page ([slug])', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Static Generation Tests
    describe('generateStaticParams', () => {
        it('should fetch all artwork slugs for static generation', async () => {
            mockGetAllArtworkSlugs.mockResolvedValue({
                data: [
                    { slug: 'artwork-1' },
                    { slug: 'artwork-2' },
                    { slug: 'artwork-3' },
                ],
                error: null,
            });

            const { generateStaticParams } = await import(
                '@/app/gallery/[slug]/page'
            );
            const params = await generateStaticParams();

            expect(params).toEqual([
                { slug: 'artwork-1' },
                { slug: 'artwork-2' },
                { slug: 'artwork-3' },
            ]);
        });

        it('should handle empty slug list', async () => {
            mockGetAllArtworkSlugs.mockResolvedValue({
                data: [],
                error: null,
            });

            const { generateStaticParams } = await import(
                '@/app/gallery/[slug]/page'
            );
            const params = await generateStaticParams();

            expect(params).toEqual([]);
        });

        it('should handle null data from getAllArtworkSlugs', async () => {
            mockGetAllArtworkSlugs.mockResolvedValue({
                data: null,
                error: null,
            });

            const { generateStaticParams } = await import(
                '@/app/gallery/[slug]/page'
            );
            const params = await generateStaticParams();

            expect(params).toEqual([]);
        });
    });

    // Page Rendering Tests
    describe('Page Rendering', () => {
        it('should render artwork title', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(
                screen.getByText('Sunset Over Mountains')
            ).toBeInTheDocument();
        });

        it('should render artwork description', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(
                screen.getByText(
                    'A breathtaking landscape capturing the golden hour light.'
                )
            ).toBeInTheDocument();
        });

        it('should render back to gallery link', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            const backLink = screen.getByRole('link', {
                name: /Back to Gallery/i,
            });
            expect(backLink).toBeInTheDocument();
            expect(backLink).toHaveAttribute('href', '/gallery');
        });

        it('should render responsive grid layout (1 col on mobile, 2 on desktop)', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            const { container } = render(result);

            const gridDiv = container.querySelector(
                '.grid.grid-cols-1.md\\:grid-cols-2'
            );
            expect(gridDiv).toBeInTheDocument();
        });
    });

    // Image Tests
    describe('Image Display', () => {
        it('should display large image when image_large_url exists', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            const img = screen.getByAltText(
                'Sunset over mountain range'
            ) as HTMLImageElement;
            expect(img).toBeInTheDocument();
            expect(img.getAttribute('src')).toContain('sunset-large.webp');
        });

        it('should fallback to image_url when image_large_url is missing', async () => {
            const artworkWithoutLarge = {
                ...mockArtworkDetail,
                image_large_url: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: artworkWithoutLarge,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            const img = screen.getByAltText(
                'Sunset over mountain range'
            ) as HTMLImageElement;
            expect(img).toBeInTheDocument();
            expect(img.getAttribute('src')).toContain('sunset.webp');
        });

        it('should display "No image available" when both image URLs are missing', async () => {
            const artworkWithoutImages = {
                ...mockArtworkDetail,
                image_large_url: null,
                image_url: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: artworkWithoutImages,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.getByText('No image available')).toBeInTheDocument();
        });

        it('should use alt_text when available for image alt attribute', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            const img = screen.getByAltText('Sunset over mountain range');
            expect(img).toBeInTheDocument();
        });

        it('should fallback to title for alt text when alt_text is missing', async () => {
            const artworkWithoutAltText = {
                ...mockArtworkDetail,
                alt_text: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: artworkWithoutAltText,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            const img = screen.getByAltText('Sunset Over Mountains');
            expect(img).toBeInTheDocument();
        });

        it('should have square aspect ratio for image container', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            const { container } = render(result);

            const imageContainer = container.querySelector('.aspect-square');
            expect(imageContainer).toBeInTheDocument();
        });
    });

    // Metadata Tests
    describe('Metadata Display', () => {
        it('should display medium when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.getByText('Medium')).toBeInTheDocument();
            expect(screen.getByText('Oil on Canvas')).toBeInTheDocument();
        });

        it('should not display medium section when missing', async () => {
            const artworkWithoutMedium = {
                ...mockArtworkDetail,
                medium: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: artworkWithoutMedium,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.queryByText('Medium')).not.toBeInTheDocument();
        });

        it('should display dimensions when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.getByText('Dimensions')).toBeInTheDocument();
            expect(screen.getByText('24 x 36 inches')).toBeInTheDocument();
        });

        it('should not display dimensions section when missing', async () => {
            const artworkWithoutDimensions = {
                ...mockArtworkDetail,
                dimensions: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: artworkWithoutDimensions,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.queryByText('Dimensions')).not.toBeInTheDocument();
        });

        it('should display year created when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.getByText('Year Created')).toBeInTheDocument();
            expect(screen.getByText('2023')).toBeInTheDocument();
        });

        it('should not display year created section when missing', async () => {
            const artworkWithoutYear = {
                ...mockArtworkDetail,
                year_created: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: artworkWithoutYear,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.queryByText('Year Created')).not.toBeInTheDocument();
        });

        it('should display all tags when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.getByText('Tags')).toBeInTheDocument();
            expect(screen.getByText('landscape')).toBeInTheDocument();
            expect(screen.getByText('nature')).toBeInTheDocument();
            expect(screen.getByText('sunset')).toBeInTheDocument();
        });

        it('should not display tags section when tags array is empty', async () => {
            const artworkWithoutTags = {
                ...mockArtworkDetail,
                tags: [],
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: artworkWithoutTags,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.queryByText('Tags')).not.toBeInTheDocument();
        });

        it('should not display tags section when tags is null', async () => {
            const artworkWithoutTags = {
                ...mockArtworkDetail,
                tags: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: artworkWithoutTags,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            expect(screen.queryByText('Tags')).not.toBeInTheDocument();
        });

        it('should display metadata border separator', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            const { container } = render(result);

            const borderDiv = container.querySelector('.border-t');
            expect(borderDiv).toBeInTheDocument();
        });
    });

    // Error Handling Tests
    describe('Error Handling', () => {
        it('should call notFound when artwork data is null', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: null,
                error: null,
            });
            // Make notFound throw to prevent further rendering
            mockNotFound.mockImplementation(() => {
                throw new Error('notFound');
            });

            try {
                await GalleryDetailPage({
                    params: Promise.resolve({ slug: 'nonexistent' }),
                });
            } catch {
                // Expected to throw when notFound is called
            }

            expect(mockNotFound).toHaveBeenCalled();
        });

        it('should call notFound when getArtworkBySlug returns an error', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: null,
                error: { code: 'NOT_FOUND', message: 'Artwork not found' },
            });
            // Make notFound throw to prevent further rendering
            mockNotFound.mockImplementation(() => {
                throw new Error('notFound');
            });

            try {
                await GalleryDetailPage({
                    params: Promise.resolve({ slug: 'nonexistent' }),
                });
            } catch {
                // Expected to throw when notFound is called
            }

            expect(mockNotFound).toHaveBeenCalled();
        });

        it('should call notFound with correct slug parameter', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: null,
                error: null,
            });
            // Make notFound throw to prevent further rendering
            mockNotFound.mockImplementation(() => {
                throw new Error('notFound');
            });

            try {
                await GalleryDetailPage({
                    params: Promise.resolve({ slug: 'test-slug' }),
                });
            } catch {
                // Expected to throw when notFound is called
            }

            expect(mockGetArtworkBySlug).toHaveBeenCalledWith('test-slug');
            expect(mockNotFound).toHaveBeenCalled();
        });
    });

    // Dynamic Route Tests
    describe('Dynamic Route Handling', () => {
        it('should extract slug from params', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });

            expect(mockGetArtworkBySlug).toHaveBeenCalledWith(
                'sunset-over-mountains'
            );
        });

        it('should handle slug with hyphens', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            await GalleryDetailPage({
                params: Promise.resolve({ slug: 'multi-word-artwork-title' }),
            });

            expect(mockGetArtworkBySlug).toHaveBeenCalledWith(
                'multi-word-artwork-title'
            );
        });
    });

    // Styling Tests
    describe('Styling and Layout', () => {
        it('should have white background', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            const { container } = render(result);

            const mainDiv = container.querySelector('.bg-white');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should have black text color', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            const { container } = render(result);

            const mainDiv = container.querySelector('.text-black');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should have max-width constraint on content', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            const { container } = render(result);

            const contentDiv = container.querySelector('.max-w-6xl');
            expect(contentDiv).toBeInTheDocument();
        });

        it('should have responsive horizontal padding', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            const { container } = render(result);

            const contentDiv = container.querySelector('.sm\\:px-6');
            expect(contentDiv).toBeInTheDocument();
        });

        it('should render h1 for title', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            const heading = screen.getByRole('heading', {
                level: 1,
                name: 'Sunset Over Mountains',
            });
            expect(heading).toBeInTheDocument();
        });

        it('should render h3 for metadata headings', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            const mediumHeading = screen.getByRole('heading', {
                level: 3,
                name: 'Medium',
            });
            expect(mediumHeading).toBeInTheDocument();
        });
    });

    // Integration Tests
    describe('Integration', () => {
        it('should render complete artwork detail page with all sections', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockArtworkDetail,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            // Header
            expect(
                screen.getByText('Sunset Over Mountains')
            ).toBeInTheDocument();
            expect(screen.getByText(/Back to Gallery/i)).toBeInTheDocument();

            // Image
            expect(
                screen.getByAltText('Sunset over mountain range')
            ).toBeInTheDocument();

            // Description
            expect(
                screen.getByText(
                    'A breathtaking landscape capturing the golden hour light.'
                )
            ).toBeInTheDocument();

            // Metadata
            expect(screen.getByText('Medium')).toBeInTheDocument();
            expect(screen.getByText('Dimensions')).toBeInTheDocument();
            expect(screen.getByText('Year Created')).toBeInTheDocument();
            expect(screen.getByText('Tags')).toBeInTheDocument();
        });

        it('should handle partial metadata gracefully', async () => {
            const partialArtwork = {
                ...mockArtworkDetail,
                medium: null,
                tags: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: partialArtwork,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            // Should still show available metadata
            expect(screen.getByText('Dimensions')).toBeInTheDocument();
            expect(screen.getByText('Year Created')).toBeInTheDocument();

            // Should not show missing metadata
            expect(screen.queryByText('Medium')).not.toBeInTheDocument();
            expect(screen.queryByText('Tags')).not.toBeInTheDocument();
        });

        it('should render minimal page when only title and image exist', async () => {
            const minimalArtwork = {
                ...mockArtworkDetail,
                description: null,
                medium: null,
                dimensions: null,
                year_created: null,
                tags: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: minimalArtwork,
                error: null,
            });

            const result = await GalleryDetailPage({
                params: Promise.resolve({ slug: 'sunset-over-mountains' }),
            });
            render(result);

            // Essential elements should be present
            expect(
                screen.getByText('Sunset Over Mountains')
            ).toBeInTheDocument();
            expect(
                screen.getByAltText('Sunset over mountain range')
            ).toBeInTheDocument();

            // Description and metadata should not be shown
            expect(screen.queryByText('Medium')).not.toBeInTheDocument();
        });
    });

    // ISR Tests
    describe('ISR (Incremental Static Regeneration)', () => {
        it('should have revalidate set to 3600 seconds', async () => {
            const { revalidate } = await import('@/app/gallery/[slug]/page');
            expect(revalidate).toBe(3600);
        });
    });
});

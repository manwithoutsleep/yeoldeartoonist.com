/**
 * Tests for Shoppe Detail Page ([slug])
 *
 * The shoppe detail page is a server component that:
 * - Displays a single product with full details
 * - Shows e-commerce metadata (price, inventory, SKU)
 * - Shows artwork metadata (medium, dimensions, year created, tags)
 * - Includes Add to Cart functionality
 * - Shows large image with lightbox functionality
 * - Handles missing products with notFound()
 * - Uses static generation with ISR (filtered to inventory > 0)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - RED phase: route doesn't exist yet, will be created in GREEN phase
import ShoppeDetailPage from '@/app/shoppe/[slug]/page';
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

// Mock AddToCartButton to avoid CartProvider dependency in server component tests
vi.mock('@/components/shoppe/AddToCartButton', () => {
    return {
        AddToCartButton: function AddToCartButton() {
            return (
                <button
                    type="button"
                    aria-label="Add to Cart"
                    data-testid="add-to-cart-button"
                >
                    Add to Cart
                </button>
            );
        },
    };
});

// Mock StructuredData component to render JSON-LD script tags
vi.mock('@/components/seo/StructuredData', () => {
    return {
        StructuredData: function StructuredData({ data }: { data: unknown }) {
            return (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
                />
            );
        },
    };
});

import { getArtworkBySlug, getAllArtworkSlugs } from '@/lib/db/artwork';
import { Database } from '@/types/database';

const mockGetArtworkBySlug = vi.mocked(getArtworkBySlug);
const mockGetAllArtworkSlugs = vi.mocked(getAllArtworkSlugs);
const mockNotFound = vi.mocked(notFound);

type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

// Mock product with full data
const mockProductDetail: ArtworkRow = {
    id: '1',
    title: 'Mountain Sunset Print',
    description:
        'A beautiful print of a mountain sunset, perfect for any home.',
    slug: 'mountain-sunset-print',
    image_large_url: '/images/sunset-large.webp',
    image_thumbnail_url: '/images/sunset-thumb.webp',
    image_url: '/images/sunset-preview.webp',
    alt_text: 'Mountain sunset print',
    price: '49.99',
    original_price: '69.99',
    sku: 'PRINT-001',
    inventory_count: 10,
    is_limited_edition: false,
    medium: 'Giclée Print',
    dimensions: '16 x 20 inches',
    year_created: 2024,
    is_published: true,
    is_featured: true,
    display_order: 1,
    seo_title: null,
    seo_description: null,
    tags: ['print', 'landscape', 'sunset'],
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
};

// Mock product with low stock
const mockLowStockProduct: ArtworkRow = {
    ...mockProductDetail,
    inventory_count: 3,
};

// Mock product out of stock
const mockOutOfStockProduct: ArtworkRow = {
    ...mockProductDetail,
    inventory_count: 0,
};

// Mock product without sale pricing
const mockRegularPriceProduct: ArtworkRow = {
    ...mockProductDetail,
    original_price: null,
};

describe('Shoppe Detail Page ([slug])', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Static Generation Tests
    describe('generateStaticParams', () => {
        it('should fetch all artwork slugs for static generation', async () => {
            mockGetAllArtworkSlugs.mockResolvedValue({
                data: [
                    { slug: 'product-1' },
                    { slug: 'product-2' },
                    { slug: 'product-3' },
                ],
                error: null,
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - RED phase: route doesn't exist yet
            const { generateStaticParams } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - RED phase: route doesn't exist yet
                await import('@/app/shoppe/[slug]/page');
            const params = await generateStaticParams();

            expect(params).toEqual([
                { slug: 'product-1' },
                { slug: 'product-2' },
                { slug: 'product-3' },
            ]);
        });

        it('should handle empty slug list', async () => {
            mockGetAllArtworkSlugs.mockResolvedValue({
                data: [],
                error: null,
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - RED phase: route doesn't exist yet
            const { generateStaticParams } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - RED phase: route doesn't exist yet
                await import('@/app/shoppe/[slug]/page');
            const params = await generateStaticParams();

            expect(params).toEqual([]);
        });

        it('should handle null data from getAllArtworkSlugs', async () => {
            mockGetAllArtworkSlugs.mockResolvedValue({
                data: null,
                error: null,
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - RED phase: route doesn't exist yet
            const { generateStaticParams } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - RED phase: route doesn't exist yet
                await import('@/app/shoppe/[slug]/page');
            const params = await generateStaticParams();

            expect(params).toEqual([]);
        });
    });

    // Page Rendering Tests
    describe('Page Rendering', () => {
        it('should render artwork title', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(
                screen.getByText('Mountain Sunset Print')
            ).toBeInTheDocument();
        });

        it('should render artwork description', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(
                screen.getByText(
                    'A beautiful print of a mountain sunset, perfect for any home.'
                )
            ).toBeInTheDocument();
        });

        it('should render back to shoppe link', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            const backLink = screen.getByRole('link', {
                name: /Back to Shoppe/i,
            });
            expect(backLink).toBeInTheDocument();
            expect(backLink).toHaveAttribute('href', '/shoppe');
        });

        it('should render responsive grid layout (1 col on mobile, 2 on desktop)', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            const { container } = render(result);

            const gridDiv = container.querySelector(
                '.grid.grid-cols-1.md\\:grid-cols-2'
            );
            expect(gridDiv).toBeInTheDocument();
        });
    });

    // Image Display Tests
    describe('Image Display', () => {
        it('should display 800px image (image_url) in main view', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            const img = screen.getByAltText(
                'Mountain sunset print'
            ) as HTMLImageElement;
            expect(img).toBeInTheDocument();
            expect(img.getAttribute('src')).toContain('sunset-preview.webp');
        });

        it('should still display main image when image_large_url is missing', async () => {
            const productWithoutLarge = {
                ...mockProductDetail,
                image_large_url: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutLarge,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            const img = screen.getByAltText(
                'Mountain sunset print'
            ) as HTMLImageElement;
            expect(img).toBeInTheDocument();
            // Main view still uses image_url (800px)
            expect(img.getAttribute('src')).toContain('sunset-preview.webp');
        });

        it('should display "No image available" when both image URLs are missing', async () => {
            const productWithoutImages = {
                ...mockProductDetail,
                image_large_url: null,
                image_url: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutImages,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.getByText('No image available')).toBeInTheDocument();
        });

        it('should use alt_text when available for image alt attribute', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            const img = screen.getByAltText('Mountain sunset print');
            expect(img).toBeInTheDocument();
        });

        it('should fallback to title for alt text when alt_text is missing', async () => {
            const productWithoutAltText = {
                ...mockProductDetail,
                alt_text: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutAltText,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            const img = screen.getByAltText('Mountain Sunset Print');
            expect(img).toBeInTheDocument();
        });
    });

    // E-commerce Metadata Tests
    describe('E-commerce Metadata Display', () => {
        it('should display price', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.getByText(/\$49\.99/)).toBeInTheDocument();
        });

        it('should display original price with strikethrough when on sale', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            const { container } = render(result);

            // Should display original price
            expect(screen.getByText(/\$69\.99/)).toBeInTheDocument();

            // Should have line-through class
            const originalPrice = container.querySelector('.line-through');
            expect(originalPrice).toBeInTheDocument();
            expect(originalPrice).toHaveTextContent('$69.99');
        });

        it('should not display original price when not on sale', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockRegularPriceProduct,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            // Should not display strikethrough price
            expect(screen.queryByText(/\$69\.99/)).not.toBeInTheDocument();
        });

        it('should display inventory count when low stock (< 5)', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockLowStockProduct,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(
                screen.getByText(/Only 3 left in stock/i)
            ).toBeInTheDocument();
        });

        it('should not display inventory count when stock is sufficient (>= 5)', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail, // inventory_count: 10
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(
                screen.queryByText(/left in stock/i)
            ).not.toBeInTheDocument();
        });

        it('should display "Out of Stock" when inventory is 0', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockOutOfStockProduct,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.getByText(/Out of Stock/i)).toBeInTheDocument();
        });

        it('should display SKU when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.getByText(/SKU: PRINT-001/i)).toBeInTheDocument();
        });

        it('should not display SKU section when SKU is missing', async () => {
            const productWithoutSKU = {
                ...mockProductDetail,
                sku: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutSKU,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.queryByText(/SKU:/i)).not.toBeInTheDocument();
        });

        it('should display Add to Cart button', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            const addToCartButton = screen.getByRole('button', {
                name: /Add to Cart/i,
            });
            expect(addToCartButton).toBeInTheDocument();
        });
    });

    // Artwork Metadata Tests
    describe('Artwork Metadata Display', () => {
        it('should display medium when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.getByText('Medium')).toBeInTheDocument();
            expect(screen.getByText('Giclée Print')).toBeInTheDocument();
        });

        it('should not display medium section when missing', async () => {
            const productWithoutMedium = {
                ...mockProductDetail,
                medium: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutMedium,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.queryByText('Medium')).not.toBeInTheDocument();
        });

        it('should display dimensions when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.getByText('Dimensions')).toBeInTheDocument();
            expect(screen.getByText('16 x 20 inches')).toBeInTheDocument();
        });

        it('should not display dimensions section when missing', async () => {
            const productWithoutDimensions = {
                ...mockProductDetail,
                dimensions: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutDimensions,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.queryByText('Dimensions')).not.toBeInTheDocument();
        });

        it('should display year created when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.getByText('Year Created')).toBeInTheDocument();
            expect(screen.getByText('2024')).toBeInTheDocument();
        });

        it('should not display year created section when missing', async () => {
            const productWithoutYear = {
                ...mockProductDetail,
                year_created: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutYear,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.queryByText('Year Created')).not.toBeInTheDocument();
        });

        it('should display tags when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.getByText('Tags')).toBeInTheDocument();
            expect(screen.getByText('print')).toBeInTheDocument();
            expect(screen.getByText('landscape')).toBeInTheDocument();
            expect(screen.getByText('sunset')).toBeInTheDocument();
        });

        it('should not display tags section when tags array is empty', async () => {
            const productWithoutTags = {
                ...mockProductDetail,
                tags: [],
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutTags,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.queryByText('Tags')).not.toBeInTheDocument();
        });

        it('should not display tags section when tags is null', async () => {
            const productWithoutTags = {
                ...mockProductDetail,
                tags: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutTags,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            expect(screen.queryByText('Tags')).not.toBeInTheDocument();
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
                await ShoppeDetailPage({
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
                error: { code: 'NOT_FOUND', message: 'Product not found' },
            });
            // Make notFound throw to prevent further rendering
            mockNotFound.mockImplementation(() => {
                throw new Error('notFound');
            });

            try {
                await ShoppeDetailPage({
                    params: Promise.resolve({ slug: 'nonexistent' }),
                });
            } catch {
                // Expected to throw when notFound is called
            }

            expect(mockNotFound).toHaveBeenCalled();
        });
    });

    // SEO Metadata Tests
    describe('SEO Metadata', () => {
        it('should generate Open Graph metadata with Product schema', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            // Test metadata generation function
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - RED phase: route doesn't exist yet
            const { generateMetadata } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - RED phase: route doesn't exist yet
                await import('@/app/shoppe/[slug]/page');
            const metadata = await generateMetadata({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });

            // Verify metadata is generated correctly
            expect(metadata.title).toBe('Mountain Sunset Print');
            expect(metadata.description).toContain(
                'A beautiful print of a mountain sunset'
            );
            expect(metadata.openGraph?.title).toContain(
                'Mountain Sunset Print'
            );
            expect(metadata.openGraph?.images).toBeDefined();
        });

        it('should include price in structured data', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            const { container } = render(result);

            // Check for structured data script tag
            const structuredData = container.querySelector(
                'script[type="application/ld+json"]'
            );
            expect(structuredData).toBeInTheDocument();

            if (structuredData) {
                const jsonData = JSON.parse(structuredData.textContent || '[]');
                // Should include Product schema with price
                const productSchema = jsonData.find(
                    (item: { '@type': string }) => item['@type'] === 'Product'
                );
                expect(productSchema).toBeDefined();
                expect(productSchema.offers.price).toBeDefined();
            }
        });

        it('should include SKU in structured data when available', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            const { container } = render(result);

            // Check for structured data script tag
            const structuredData = container.querySelector(
                'script[type="application/ld+json"]'
            );
            expect(structuredData).toBeInTheDocument();

            if (structuredData) {
                const jsonData = JSON.parse(structuredData.textContent || '[]');
                // Should include Product schema with SKU
                const productSchema = jsonData.find(
                    (item: { '@type': string }) => item['@type'] === 'Product'
                );
                expect(productSchema).toBeDefined();
                expect(productSchema.sku).toBe('PRINT-001');
            }
        });

        it('should omit SKU from structured data when not available', async () => {
            const productWithoutSku = { ...mockProductDetail, sku: null };
            mockGetArtworkBySlug.mockResolvedValue({
                data: productWithoutSku,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            const { container } = render(result);

            // Check for structured data script tag
            const structuredData = container.querySelector(
                'script[type="application/ld+json"]'
            );
            expect(structuredData).toBeInTheDocument();

            if (structuredData) {
                const jsonData = JSON.parse(structuredData.textContent || '[]');
                // Should include Product schema without SKU
                const productSchema = jsonData.find(
                    (item: { '@type': string }) => item['@type'] === 'Product'
                );
                expect(productSchema).toBeDefined();
                expect(productSchema.sku).toBeUndefined();
            }
        });

        it('should use appropriate image for social preview', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - RED phase: route doesn't exist yet
            const { generateMetadata } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - RED phase: route doesn't exist yet
                await import('@/app/shoppe/[slug]/page');
            const metadata = await generateMetadata({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });

            // Should use image_large_url or fallback to image_url
            expect(metadata.openGraph?.images).toBeDefined();
            const images = metadata.openGraph?.images as Array<{
                url: string;
            }>;
            expect(images[0].url).toBeTruthy();
        });

        it('should set availability to InStock when inventory > 0', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            const { container } = render(result);

            const structuredData = container.querySelector(
                'script[type="application/ld+json"]'
            );
            if (structuredData) {
                const jsonData = JSON.parse(structuredData.textContent || '[]');
                const productSchema = jsonData.find(
                    (item: { '@type': string }) => item['@type'] === 'Product'
                );
                expect(productSchema.offers.availability).toContain('InStock');
            }
        });

        it('should set availability to OutOfStock when inventory = 0', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockOutOfStockProduct,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            const { container } = render(result);

            const structuredData = container.querySelector(
                'script[type="application/ld+json"]'
            );
            if (structuredData) {
                const jsonData = JSON.parse(structuredData.textContent || '[]');
                const productSchema = jsonData.find(
                    (item: { '@type': string }) => item['@type'] === 'Product'
                );
                expect(productSchema.offers.availability).toContain(
                    'OutOfStock'
                );
            }
        });
    });

    // ISR Tests
    describe('ISR (Incremental Static Regeneration)', () => {
        it('should have revalidate set to 3600 seconds', async () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - RED phase: route doesn't exist yet
            const { revalidate } =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - RED phase: route doesn't exist yet
                await import('@/app/shoppe/[slug]/page');
            expect(revalidate).toBe(3600);
        });
    });

    // Styling Tests
    describe('Styling and Layout', () => {
        it('should have white background', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            const { container } = render(result);

            const mainDiv = container.querySelector('.bg-white');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should have black text color', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            const { container } = render(result);

            const mainDiv = container.querySelector('.text-black');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should render h1 for title', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            const heading = screen.getByRole('heading', {
                level: 1,
                name: 'Mountain Sunset Print',
            });
            expect(heading).toBeInTheDocument();
        });
    });

    // Integration Tests
    describe('Integration', () => {
        it('should render complete product detail page with all sections', async () => {
            mockGetArtworkBySlug.mockResolvedValue({
                data: mockProductDetail,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            // Header
            expect(
                screen.getByText('Mountain Sunset Print')
            ).toBeInTheDocument();
            expect(screen.getByText(/Back to Shoppe/i)).toBeInTheDocument();

            // Image
            expect(
                screen.getByAltText('Mountain sunset print')
            ).toBeInTheDocument();

            // Description
            expect(
                screen.getByText(
                    'A beautiful print of a mountain sunset, perfect for any home.'
                )
            ).toBeInTheDocument();

            // E-commerce metadata
            expect(screen.getByText(/\$49\.99/)).toBeInTheDocument();
            expect(screen.getByText(/\$69\.99/)).toBeInTheDocument(); // Original price
            expect(screen.getByText(/SKU: PRINT-001/i)).toBeInTheDocument();

            // Artwork metadata
            expect(screen.getByText('Medium')).toBeInTheDocument();
            expect(screen.getByText('Dimensions')).toBeInTheDocument();
            expect(screen.getByText('Year Created')).toBeInTheDocument();
            expect(screen.getByText('Tags')).toBeInTheDocument();

            // Add to Cart button
            expect(
                screen.getByRole('button', { name: /Add to Cart/i })
            ).toBeInTheDocument();
        });

        it('should handle partial metadata gracefully', async () => {
            const partialProduct = {
                ...mockProductDetail,
                medium: null,
                tags: null,
                original_price: null,
                sku: null,
            };

            mockGetArtworkBySlug.mockResolvedValue({
                data: partialProduct,
                error: null,
            });

            const result = await ShoppeDetailPage({
                params: Promise.resolve({ slug: 'mountain-sunset-print' }),
            });
            render(result);

            // Should still show available metadata
            expect(screen.getByText('Dimensions')).toBeInTheDocument();
            expect(screen.getByText('Year Created')).toBeInTheDocument();
            expect(screen.getByText(/\$49\.99/)).toBeInTheDocument();

            // Should not show missing metadata
            expect(screen.queryByText('Medium')).not.toBeInTheDocument();
            expect(screen.queryByText('Tags')).not.toBeInTheDocument();
            expect(screen.queryByText(/\$69\.99/)).not.toBeInTheDocument();
            expect(screen.queryByText(/SKU:/i)).not.toBeInTheDocument();
        });
    });
});

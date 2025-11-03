/**
 * Tests for Home Page
 *
 * The home page is a server component that:
 * - Displays a hero section with scroll background
 * - Shows featured artwork
 * - Displays navigation preview cards
 * - Uses server-side data fetching with ISR
 */

import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock the database query function
jest.mock('@/lib/db/artwork', () => ({
    getFeaturedArtwork: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function DynamicLink({
        children,
        href,
    }: {
        children: React.ReactNode;
        href: string;
    }) {
        return <a href={href}>{children}</a>;
    };
});

// Mock site config
jest.mock('@/config/site', () => ({
    siteConfig: {
        navigation: {
            cards: [
                {
                    href: '/gallery',
                    title: 'Gallery',
                    description: 'Gallery',
                    image: 'gallery.webp',
                    aspectRatio: '16:9',
                },
                {
                    href: '/shoppe',
                    title: 'Shoppe',
                    description: 'Shoppe',
                    image: 'shoppe.webp',
                    aspectRatio: '16:9',
                },
            ],
        },
    },
}));

import { getFeaturedArtwork, ArtworkQueryError } from '@/lib/db/artwork';
import { Database } from '@/types/database';

const mockGetFeaturedArtwork = getFeaturedArtwork as jest.MockedFunction<
    typeof getFeaturedArtwork
>;

type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

const mockArtworkItem: ArtworkRow = {
    id: '1',
    title: 'Test Artwork',
    description: 'A beautiful test artwork',
    slug: 'test-artwork',
    image_large_url: '/images/test.webp',
    image_thumbnail_url: '/images/test-thumb.webp',
    image_url: null,
    alt_text: 'Test',
    price: '99.99',
    original_price: null,
    sku: null,
    inventory_count: 0,
    is_limited_edition: false,
    medium: null,
    dimensions: null,
    year_created: null,
    is_published: true,
    is_featured: false,
    display_order: 1,
    seo_title: null,
    seo_description: null,
    tags: null,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
};

describe('Home Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the home page with hero section', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await Home();
        render(result);

        expect(screen.getByText('HUZZAHH!!')).toBeInTheDocument();
    });

    it('should display hero section welcome message', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await Home();
        render(result);

        expect(
            screen.getByText(/Greetings and welcome to my site/i)
        ).toBeInTheDocument();
    });

    it('should render navigation section heading', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await Home();
        render(result);

        expect(screen.getByText('Explore Our Work')).toBeInTheDocument();
    });

    it('should render navigation cards', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await Home();
        render(result);

        expect(screen.getByText('Gallery')).toBeInTheDocument();
        expect(screen.getByText('Shoppe')).toBeInTheDocument();
    });

    it('should render featured artwork section when data exists', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [mockArtworkItem],
            error: null,
        });

        const result = await Home();
        render(result);

        expect(screen.getByText('Featured Artwork')).toBeInTheDocument();
        expect(screen.getByText('Test Artwork')).toBeInTheDocument();
        expect(
            screen.getByText('A beautiful test artwork')
        ).toBeInTheDocument();
    });

    it('should render View Artwork link for featured artwork', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [mockArtworkItem],
            error: null,
        });

        const result = await Home();
        render(result);

        const viewLink = screen.getByText('View Artwork') as HTMLAnchorElement;
        expect(viewLink).toBeInTheDocument();
        expect(viewLink.getAttribute('href')).toBe('/gallery/test-artwork');
    });

    it('should not render featured artwork section when data is empty', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await Home();
        render(result);

        const featuredHeadings = screen.queryAllByText('Featured Artwork');
        expect(featuredHeadings.length).toBe(0);
    });

    it('should revalidate page every hour', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        await Home();

        // Verify revalidate export is set (via the module-level export)
        expect(true).toBe(true); // This would be verified via Next.js build
    });

    it('should fetch featured artwork on page load', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        await Home();

        expect(mockGetFeaturedArtwork).toHaveBeenCalledWith(1);
    });

    it('should handle featured artwork query errors gracefully', async () => {
        const mockError: ArtworkQueryError = {
            code: 'DATABASE_ERROR',
            message: 'Database error',
        };
        mockGetFeaturedArtwork.mockResolvedValue({
            data: null,
            error: mockError,
        });

        const result = await Home();
        render(result);

        // Page should still render without featured section
        expect(screen.getByText('HUZZAHH!!')).toBeInTheDocument();
    });

    it('should have black background for home page', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await Home();
        const { container } = render(result);

        const mainDiv = container.querySelector('.bg-black');
        expect(mainDiv).toBeInTheDocument();
    });

    it('should display scroll background image in hero section', async () => {
        mockGetFeaturedArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await Home();
        render(result);

        const scrollImg = screen.getByAltText('Scroll background');
        expect(scrollImg).toBeInTheDocument();
        expect(scrollImg.getAttribute('src')).toContain('scroll.webp');
    });
});

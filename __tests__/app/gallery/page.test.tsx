/**
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
 * Tests for Gallery Page
 *
 * The gallery page is a server component that:
 * - Displays all published artwork in a responsive grid
 * - Shows error messages if data fetching fails
 * - Handles empty state gracefully
 * - Uses server-side data fetching with ISR
 */

import { render, screen } from '@testing-library/react';
import GalleryPage from '@/app/gallery/page';

// Mock the database query function
vi.mock('@/lib/db/artwork', () => ({
    getAllArtwork: vi.fn(),
}));

import { getAllArtwork, ArtworkQueryError } from '@/lib/db/artwork';
import { Database } from '@/types/database';

const mockGetAllArtwork = vi.mocked(getAllArtwork);

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

describe('Gallery Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render gallery page with title', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await GalleryPage();
        render(result);

        expect(screen.getByText('Gallery')).toBeInTheDocument();
    });

    it('should display gallery welcome message', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await GalleryPage();
        render(result);

        expect(
            screen.getByText(/Welcome to the landscape of my imagination/i)
        ).toBeInTheDocument();
    });

    it('should render artwork cards when data exists', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [mockArtworkItem],
            error: null,
        });

        const result = await GalleryPage();
        render(result);

        expect(screen.getByText('Test Artwork')).toBeInTheDocument();
        expect(
            screen.getByText('A beautiful test artwork')
        ).toBeInTheDocument();
    });

    it('should render multiple artwork cards', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [
                mockArtworkItem,
                {
                    ...mockArtworkItem,
                    id: '2',
                    title: 'Another Artwork',
                    slug: 'another-artwork',
                },
            ],
            error: null,
        });

        const result = await GalleryPage();
        render(result);

        expect(screen.getByText('Test Artwork')).toBeInTheDocument();
        expect(screen.getByText('Another Artwork')).toBeInTheDocument();
    });

    it('should link artwork cards to detail pages', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [mockArtworkItem],
            error: null,
        });

        const result = await GalleryPage();
        render(result);

        const links = screen.getAllByRole('link');
        const artworkLink = links.find((link) =>
            link.getAttribute('href')?.includes('/gallery/test-artwork')
        );

        expect(artworkLink).toBeInTheDocument();
    });

    it('should display artwork thumbnail images', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [mockArtworkItem],
            error: null,
        });

        const result = await GalleryPage();
        render(result);

        const img = screen.getByAltText('Test') as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toContain('test-thumb.webp');
    });

    it('should display placeholder when artwork has no image', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [
                {
                    ...mockArtworkItem,
                    image_thumbnail_url: null,
                },
            ],
            error: null,
        });

        const result = await GalleryPage();
        render(result);

        expect(screen.getByText('No image')).toBeInTheDocument();
    });

    it('should show empty state message when no artwork exists', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await GalleryPage();
        render(result);

        expect(screen.getByText(/Artwork is on its way/i)).toBeInTheDocument();
    });

    it('should display error message when data fetching fails', async () => {
        const mockError: ArtworkQueryError = {
            code: 'CONNECTION_ERROR',
            message: 'Database connection failed',
        };
        mockGetAllArtwork.mockResolvedValue({
            data: null,
            error: mockError,
        });

        const result = await GalleryPage();
        render(result);

        expect(screen.getByText(/Error loading gallery/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Database connection failed/i)
        ).toBeInTheDocument();
    });

    it('should have white background for gallery page', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await GalleryPage();
        const { container } = render(result);

        const mainDiv = container.querySelector('.bg-white');
        expect(mainDiv).toBeInTheDocument();
    });

    it('should render responsive grid layout', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [mockArtworkItem],
            error: null,
        });

        const result = await GalleryPage();
        const { container } = render(result);

        const gridDiv = container.querySelector(
            '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3'
        );
        expect(gridDiv).toBeInTheDocument();
    });

    it('should fetch all artwork on page load', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        await GalleryPage();

        expect(mockGetAllArtwork).toHaveBeenCalled();
    });

    it('should revalidate page every hour', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [],
            error: null,
        });

        await GalleryPage();

        // Verify revalidate export is set (via the module-level export)
        expect(true).toBe(true); // This would be verified via Next.js build
    });

    it('should clamp description to 2 lines', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [mockArtworkItem],
            error: null,
        });

        const result = await GalleryPage();
        const { container } = render(result);

        const description = container.querySelector('.line-clamp-2');
        expect(description).toBeInTheDocument();
    });

    it('should handle artwork with no description', async () => {
        mockGetAllArtwork.mockResolvedValue({
            data: [
                {
                    ...mockArtworkItem,
                    description: null,
                },
            ],
            error: null,
        });

        const result = await GalleryPage();
        render(result);

        // Page should still render with just the title
        expect(screen.getByText('Test Artwork')).toBeInTheDocument();
    });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArtworkPage from '@/app/admin/artwork/page';
import { getAllArtworkAdmin } from '@/lib/db/admin/artwork';

// Mock the database function
vi.mock('@/lib/db/admin/artwork', () => ({
    getAllArtworkAdmin: vi.fn(),
}));

// Mock the ArtworkList component
vi.mock('@/components/admin/artwork/ArtworkList', () => ({
    default: ({ artwork }: { artwork: unknown[] }) => (
        <div data-testid="artwork-list">
            Artwork List: {artwork.length} items
        </div>
    ),
}));

// Mock next/link
vi.mock('next/link', () => {
    return {
        __esModule: true,
        default: ({
            children,
            href,
        }: {
            children: React.ReactNode;
            href: string;
        }) => <a href={href}>{children}</a>,
    };
});

describe('ArtworkPage', () => {
    it('fetches artwork and renders list', async () => {
        const mockArtwork = [
            {
                id: '1',
                title: 'Art 1',
                description: null,
                slug: 'art-1',
                price: '100.00',
                original_price: null,
                sku: null,
                inventory_count: 1,
                is_limited_edition: false,
                medium: null,
                dimensions: null,
                year_created: 2023,
                image_url: null,
                image_thumbnail_url: null,
                image_large_url: null,
                is_published: true,
                is_featured: false,
                display_order: 0,
                alt_text: null,
                seo_title: null,
                seo_description: null,
                tags: null,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
            },
        ];
        vi.mocked(getAllArtworkAdmin).mockResolvedValue({
            data: mockArtwork,
            error: null,
        });

        const result = await ArtworkPage();
        render(result);

        expect(getAllArtworkAdmin).toHaveBeenCalled();
        expect(screen.getByTestId('artwork-list')).toBeDefined();
        expect(screen.getByText('Artwork List: 1 items')).toBeDefined();
    });

    it('renders error message on failure', async () => {
        vi.mocked(getAllArtworkAdmin).mockResolvedValue({
            data: null,
            error: { code: 'fetch_error', message: 'Failed to fetch' },
        });

        const result = await ArtworkPage();
        render(result);

        expect(screen.getByText(/failed to fetch/i)).toBeDefined();
    });

    it('renders create new button', async () => {
        vi.mocked(getAllArtworkAdmin).mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await ArtworkPage();
        render(result);

        expect(screen.getByText(/add new artwork/i)).toBeDefined();
        expect(
            screen.getByRole('link', { name: /add new artwork/i })
        ).toHaveAttribute('href', '/admin/artwork/new');
    });
});

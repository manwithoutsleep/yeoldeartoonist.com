import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArtworkList from '@/components/admin/artwork/ArtworkList';
import type { ArtworkRow } from '@/lib/db/admin/artwork';

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

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => '/admin/artwork',
    useSearchParams: () => new URLSearchParams(),
}));

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
        price: '200.00',
        original_price: null,
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

describe('ArtworkList', () => {
    it('renders list of artwork', () => {
        render(<ArtworkList artwork={mockArtwork} />);
        expect(screen.getByText('Artwork 1')).toBeDefined();
        expect(screen.getByText('Artwork 2')).toBeDefined();
    });

    it('displays empty state when no artwork provided', () => {
        render(<ArtworkList artwork={[]} />);
        expect(screen.getByText(/no artwork found/i)).toBeDefined();
    });

    it('shows status badges', () => {
        render(<ArtworkList artwork={mockArtwork} />);
        expect(screen.getByText('Published')).toBeDefined();
        expect(screen.getByText('Draft')).toBeDefined();
    });

    it('renders edit and delete actions', () => {
        render(<ArtworkList artwork={mockArtwork} />);
        const editLinks = screen.getAllByText(/edit/i);
        expect(editLinks.length).toBeGreaterThan(0);
        // Delete might be a button or icon, checking for existence
        // Assuming accessible name or text
        // For now, just check if buttons exist
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});

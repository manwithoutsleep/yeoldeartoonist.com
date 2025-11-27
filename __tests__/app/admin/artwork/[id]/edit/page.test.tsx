import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notFound } from 'next/navigation';
import EditArtworkPage from '@/app/admin/artwork/[id]/edit/page';
import * as artworkDb from '@/lib/db/admin/artwork';
import type { Database } from '@/types/database';

type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

// Mock next/navigation
vi.mock('next/navigation', () => ({
    notFound: vi.fn(),
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
    }),
}));

// Mock the artwork database functions
vi.mock('@/lib/db/admin/artwork', () => ({
    getArtworkById: vi.fn(),
}));

// Helper function to create complete mock artwork
function createMockArtwork(overrides: Partial<ArtworkRow> = {}): ArtworkRow {
    return {
        id: '123',
        title: 'Test Artwork',
        description: null,
        slug: 'test-artwork',
        price: '100.00',
        original_price: null,
        sku: null,
        inventory_count: 5,
        is_limited_edition: false,
        medium: null,
        dimensions: null,
        year_created: null,
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
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('EditArtworkPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches artwork by ID from params', async () => {
        const mockArtwork = createMockArtwork();

        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: mockArtwork,
            error: null,
        });

        const params = Promise.resolve({ id: '123' });
        await EditArtworkPage({ params });

        expect(artworkDb.getArtworkById).toHaveBeenCalledWith('123');
    });

    it('renders form with fetched artwork data', async () => {
        const mockArtwork = createMockArtwork({
            sku: 'TEST-001',
            original_price: '150.00',
            alt_text: 'Test alt text',
            seo_title: 'Test SEO Title',
            seo_description: 'Test SEO description',
            tags: ['test', 'artwork'],
        });

        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: mockArtwork,
            error: null,
        });

        const params = Promise.resolve({ id: '123' });
        const result = await EditArtworkPage({ params });

        render(result);

        expect(screen.getByText(/edit artwork/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^title$/i)).toHaveValue('Test Artwork');
        expect(screen.getByLabelText(/^slug$/i)).toHaveValue('test-artwork');
        expect(screen.getByLabelText(/^price$/i)).toHaveValue('100.00');
    });

    it('calls notFound when artwork is not found', async () => {
        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: null,
            error: null,
        });

        const params = Promise.resolve({ id: 'nonexistent' });

        await EditArtworkPage({ params });

        expect(notFound).toHaveBeenCalled();
    });

    it('calls notFound when there is an error fetching artwork', async () => {
        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: null,
            error: { message: 'Database error' } as never,
        });

        const params = Promise.resolve({ id: '123' });

        await EditArtworkPage({ params });

        expect(notFound).toHaveBeenCalled();
    });

    it('renders page title', async () => {
        const mockArtwork = createMockArtwork();

        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: mockArtwork,
            error: null,
        });

        const params = Promise.resolve({ id: '123' });
        const result = await EditArtworkPage({ params });

        render(result);

        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent(/edit artwork/i);
    });

    it('passes artwork data as initialData to form', async () => {
        const mockArtwork = createMockArtwork({
            sku: 'TEST-001',
        });

        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: mockArtwork,
            error: null,
        });

        const params = Promise.resolve({ id: '123' });
        const result = await EditArtworkPage({ params });

        render(result);

        // Verify form fields are populated
        expect(screen.getByLabelText(/^title$/i)).toHaveValue('Test Artwork');
        expect(screen.getByLabelText(/^slug$/i)).toHaveValue('test-artwork');
        expect(screen.getByLabelText(/^sku$/i)).toHaveValue('TEST-001');
    });

    it('handles artwork with null optional fields', async () => {
        const mockArtwork = createMockArtwork({
            is_published: false,
            sku: null,
            original_price: null,
            alt_text: null,
            seo_title: null,
            seo_description: null,
            tags: null,
        });

        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: mockArtwork,
            error: null,
        });

        const params = Promise.resolve({ id: '123' });
        const result = await EditArtworkPage({ params });

        render(result);

        expect(screen.getByLabelText(/^title$/i)).toHaveValue('Test Artwork');
        expect(screen.getByLabelText(/^sku$/i)).toHaveValue('');
        expect(screen.getByLabelText(/tags/i)).toHaveValue('');
    });

    it('renders form with Save button', async () => {
        const mockArtwork = createMockArtwork();

        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: mockArtwork,
            error: null,
        });

        const params = Promise.resolve({ id: '123' });
        const result = await EditArtworkPage({ params });

        render(result);

        expect(
            screen.getByRole('button', { name: /save/i })
        ).toBeInTheDocument();
    });

    it('renders form with Cancel button', async () => {
        const mockArtwork = createMockArtwork();

        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: mockArtwork,
            error: null,
        });

        const params = Promise.resolve({ id: '123' });
        const result = await EditArtworkPage({ params });

        render(result);

        expect(
            screen.getByRole('button', { name: /cancel/i })
        ).toBeInTheDocument();
    });

    it('renders Back to Artwork List link', async () => {
        const mockArtwork = createMockArtwork();

        vi.spyOn(artworkDb, 'getArtworkById').mockResolvedValue({
            data: mockArtwork,
            error: null,
        });

        const params = Promise.resolve({ id: '123' });
        const result = await EditArtworkPage({ params });

        render(result);

        const backLink = screen.getByRole('link', {
            name: /back to artwork list/i,
        });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/admin/artwork');
    });
});

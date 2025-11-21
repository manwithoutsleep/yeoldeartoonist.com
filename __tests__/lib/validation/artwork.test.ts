import { describe, expect, it } from 'vitest';
import { artworkSchema } from '@/lib/validation/artwork';

describe('Artwork Validation Schema', () => {
    it('validates a correct artwork object', () => {
        const validArtwork = {
            title: 'Valid Artwork',
            slug: 'valid-artwork',
            price: '100.00',
            inventory_count: 1,
            is_published: true,
            is_featured: false,
            is_limited_edition: false,
            display_order: 0,
        };

        const result = artworkSchema.safeParse(validArtwork);
        expect(result.success).toBe(true);
    });

    it('fails on missing required fields', () => {
        const invalidArtwork = {
            title: 'Missing Fields',
        };

        const result = artworkSchema.safeParse(invalidArtwork);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.slug).toBeDefined();
            expect(result.error.flatten().fieldErrors.price).toBeDefined();
        }
    });

    it('validates price format', () => {
        const invalidPrice = {
            title: 'Invalid Price',
            slug: 'invalid-price',
            price: 'abc',
            inventory_count: 1,
            is_published: true,
        };

        const result = artworkSchema.safeParse(invalidPrice);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.price).toBeDefined();
        }
    });

    it('validates slug format', () => {
        const invalidSlug = {
            title: 'Invalid Slug',
            slug: 'Invalid Slug With Spaces',
            price: '100.00',
            inventory_count: 1,
            is_published: true,
        };

        const result = artworkSchema.safeParse(invalidSlug);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.slug).toBeDefined();
        }
    });

    it('validates inventory count is non-negative', () => {
        const invalidInventory = {
            title: 'Invalid Inventory',
            slug: 'invalid-inventory',
            price: '100.00',
            inventory_count: -1,
            is_published: true,
        };

        const result = artworkSchema.safeParse(invalidInventory);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.flatten().fieldErrors.inventory_count
            ).toBeDefined();
        }
    });
});

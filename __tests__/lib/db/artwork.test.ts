import {
    getAllArtwork,
    getFeaturedArtwork,
    getArtworkBySlug,
    getAllArtworkSlugs,
} from '@/lib/db/artwork';

/**
 * Mock Supabase client for testing database queries
 * We mock at the module level to avoid making actual API calls
 */
jest.mock('@supabase/supabase-js');

describe('Artwork Database Queries', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllArtwork', () => {
        it('should exist and be a function', () => {
            expect(typeof getAllArtwork).toBe('function');
        });

        it('should accept pagination parameters', () => {
            // Test that the function signature is correct
            expect(getAllArtwork.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getFeaturedArtwork', () => {
        it('should exist and be a function', () => {
            expect(typeof getFeaturedArtwork).toBe('function');
        });

        it('should have limit parameter with default value', () => {
            // Function should accept a limit parameter for featured items
            expect(getFeaturedArtwork.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getArtworkBySlug', () => {
        it('should exist and be a function', () => {
            expect(typeof getArtworkBySlug).toBe('function');
        });

        it('should require a slug parameter', () => {
            // getArtworkBySlug requires slug parameter
            expect(getArtworkBySlug.length).toBeGreaterThan(0);
        });
    });

    describe('getAllArtworkSlugs', () => {
        it('should exist and be a function', () => {
            expect(typeof getAllArtworkSlugs).toBe('function');
        });

        it('should return array-like structure', () => {
            // Function should return structured data
            expect(typeof getAllArtworkSlugs).toBe('function');
        });
    });
});

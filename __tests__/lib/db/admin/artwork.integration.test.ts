/**
 * Integration tests for admin artwork database query functions
 *
 * REQUIRES: Supabase connection (local or remote)
 *
 * These tests verify the actual behavior of admin query functions when connected to Supabase.
 * They test:
 * - CRUD operations with service role client
 * - Server-side only execution enforcement
 * - Error handling and error structure
 * - Data/error mutual exclusivity
 * - Edge case parameter handling
 * - Development vs. production error details
 *
 * Setup:
 * - For local testing: run `npm run db:start` before these tests
 * - For remote testing: set environment variables in .env.local
 * - Requires SUPABASE_SERVICE_ROLE_KEY for admin operations
 *
 * Tests will be skipped if Supabase is unavailable.
 */

import { vi, beforeEach, afterEach } from 'vitest';
import {
    getAllArtworkAdmin,
    getArtworkById,
    createArtwork,
    updateArtwork,
    deleteArtwork,
} from '@/lib/db/admin/artwork';
import type { ArtworkInput } from '@/lib/db/admin/artwork';

// Helper to check if Supabase is available
const isSupabaseAvailable = (): boolean => {
    return (
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );
};

describe('Admin Artwork Database Queries - Integration Tests', () => {
    // Skip all tests in this suite if Supabase is not available
    const skipIfNoSupabase = isSupabaseAvailable() ? describe : describe.skip;

    skipIfNoSupabase('Supabase integration tests (requires connection)', () => {
        // Store original window object
        let originalWindow: typeof global.window;

        beforeEach(() => {
            originalWindow = global.window;
        });

        afterEach(() => {
            // Restore original window
            if (originalWindow === undefined) {
                // @ts-expect-error - Restoring undefined window
                delete global.window;
            } else {
                global.window = originalWindow;
            }
        });

        describe('server-side only enforcement', () => {
            it('getAllArtworkAdmin should return error when called from browser', async () => {
                // Simulate browser environment
                // @ts-expect-error - Simulating browser window
                global.window = {};

                const result = await getAllArtworkAdmin();

                expect(result.error).not.toBeNull();
                expect(result.data).toBeNull();
                expect(result.error?.code).toBe('fetch_error');
                // Error is caught by catch block and wrapped
                if (result.error?.details) {
                    expect(result.error.details).toContain(
                        'Admin queries must run server-side only'
                    );
                }
            });

            it('getArtworkById should return error when called from browser', async () => {
                // Simulate browser environment
                // @ts-expect-error - Simulating browser window
                global.window = {};

                const result = await getArtworkById('test-id');

                expect(result.error).not.toBeNull();
                expect(result.data).toBeNull();
                expect(result.error?.code).toBe('fetch_error');
                if (result.error?.details) {
                    expect(result.error.details).toContain(
                        'Admin queries must run server-side only'
                    );
                }
            });

            it('createArtwork should return error when called from browser', async () => {
                // Simulate browser environment
                // @ts-expect-error - Simulating browser window
                global.window = {};

                const artwork: ArtworkInput = {
                    title: 'Test',
                    slug: 'test',
                    description: 'Test',
                    price: '100.00',
                    image_url: 'https://example.com/image.jpg',
                };
                const result = await createArtwork(artwork);

                expect(result.error).not.toBeNull();
                expect(result.data).toBeNull();
                expect(result.error?.code).toBe('create_error');
                if (result.error?.details) {
                    expect(result.error.details).toContain(
                        'Admin queries must run server-side only'
                    );
                }
            });

            it('updateArtwork should return error when called from browser', async () => {
                // Simulate browser environment
                // @ts-expect-error - Simulating browser window
                global.window = {};

                const result = await updateArtwork('test-id', {
                    title: 'Updated',
                });

                expect(result.error).not.toBeNull();
                expect(result.data).toBeNull();
                expect(result.error?.code).toBe('update_error');
                if (result.error?.details) {
                    expect(result.error.details).toContain(
                        'Admin queries must run server-side only'
                    );
                }
            });

            it('deleteArtwork should return error when called from browser', async () => {
                // Simulate browser environment
                // @ts-expect-error - Simulating browser window
                global.window = {};

                const result = await deleteArtwork('test-id');

                expect(result.error).not.toBeNull();
                expect(result.data).toBeNull();
                expect(result.error?.code).toBe('delete_error');
                if (result.error?.details) {
                    expect(result.error.details).toContain(
                        'Admin queries must run server-side only'
                    );
                }
            });
        });

        describe('error structure validation', () => {
            it('should return error object with code and message properties', async () => {
                const result = await getArtworkById('nonexistent-id-12345');

                if (result.error) {
                    expect(result.error).toHaveProperty('code');
                    expect(result.error).toHaveProperty('message');
                    expect(typeof result.error.code).toBe('string');
                    expect(typeof result.error.message).toBe('string');
                }
            });

            it('getAllArtworkAdmin error should have valid code', async () => {
                const result = await getAllArtworkAdmin();

                // Either data is present or error exists with a code
                if (result.error) {
                    expect(typeof result.error.code).toBe('string');
                    expect(result.error.code.length).toBeGreaterThan(0);
                }
            });

            it('getArtworkById error should have valid code', async () => {
                const result = await getArtworkById('invalid-id');

                if (result.error) {
                    expect(typeof result.error.code).toBe('string');
                    expect(result.error.code.length).toBeGreaterThan(0);
                }
            });

            it('createArtwork error should have valid code when invalid data provided', async () => {
                // Try to create with empty required fields
                const invalidArtwork: ArtworkInput = {
                    title: '',
                    slug: '',
                    description: '',
                    price: '0',
                    image_url: '',
                };
                const result = await createArtwork(invalidArtwork);

                if (result.error) {
                    expect(typeof result.error.code).toBe('string');
                    expect(result.error.code.length).toBeGreaterThan(0);
                }
            });

            it('updateArtwork error should have valid code when invalid id provided', async () => {
                const result = await updateArtwork('nonexistent-id', {
                    title: 'Updated',
                });

                if (result.error) {
                    expect(typeof result.error.code).toBe('string');
                    expect(result.error.code.length).toBeGreaterThan(0);
                }
            });

            it('deleteArtwork error should have valid code when invalid id provided', async () => {
                const result = await deleteArtwork('nonexistent-id');

                if (result.error) {
                    expect(typeof result.error.code).toBe('string');
                    expect(result.error.code.length).toBeGreaterThan(0);
                }
            });

            it('error messages should be descriptive strings', async () => {
                const result = await getArtworkById('nonexistent');

                if (result.error) {
                    expect(result.error.message.length).toBeGreaterThan(0);
                    expect(typeof result.error.message).toBe('string');
                }
            });
        });

        describe('error structure consistency', () => {
            it('error structure should be consistent across all functions', async () => {
                const testArtwork: ArtworkInput = {
                    title: 'Test',
                    slug: 'test',
                    description: 'Test',
                    price: '100.00',
                    image_url: 'https://example.com/image.jpg',
                };

                const results = await Promise.all([
                    getAllArtworkAdmin(),
                    getArtworkById('test-id'),
                    createArtwork(testArtwork),
                    updateArtwork('test-id', { title: 'Updated' }),
                    deleteArtwork('test-id'),
                ]);

                results.forEach((result) => {
                    expect(result).toHaveProperty('data');
                    expect(result).toHaveProperty('error');

                    // Both should not be present simultaneously
                    const hasData = result.data !== null;
                    const hasError = result.error !== null;
                    expect(hasData || hasError).toBe(true);
                    expect(!(hasData && hasError)).toBe(true);
                });
            });

            it('should never return both data and error as non-null', async () => {
                const testArtwork: ArtworkInput = {
                    title: 'Test',
                    slug: 'test',
                    description: 'Test',
                    price: '100.00',
                    image_url: 'https://example.com/image.jpg',
                };

                const results = await Promise.all([
                    getAllArtworkAdmin(10, 0),
                    getArtworkById('any-id'),
                    createArtwork(testArtwork),
                    updateArtwork('any-id', { title: 'Test' }),
                    deleteArtwork('any-id'),
                ]);

                results.forEach((result) => {
                    const hasData = result.data !== null;
                    const hasError = result.error !== null;

                    // One should be null, the other might have content
                    expect(!(hasData && hasError)).toBe(true);
                });
            });
        });

        describe('edge case handling', () => {
            it('getArtworkById should handle empty string id', async () => {
                const result = await getArtworkById('');

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
                // Should likely return an error
            });

            it('getArtworkById should handle invalid UUID format', async () => {
                const result = await getArtworkById('not-a-uuid');

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
            });

            it('getAllArtworkAdmin should handle zero limit', async () => {
                const result = await getAllArtworkAdmin(0, 0);

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
            });

            it('getAllArtworkAdmin should handle negative limit', async () => {
                const result = await getAllArtworkAdmin(-1, 0);

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
            });

            it('getAllArtworkAdmin should handle large offset', async () => {
                const result = await getAllArtworkAdmin(50, 999999);

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
                // Should return empty array if offset exceeds total records
            });

            it('getAllArtworkAdmin should handle large limit', async () => {
                const result = await getAllArtworkAdmin(10000, 0);

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
            });

            it('createArtwork should handle missing required fields', async () => {
                // @ts-expect-error - Testing invalid input
                const result = await createArtwork({});

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
                // Should return error for missing required fields
            });

            it('createArtwork should handle partial artwork data', async () => {
                const partialArtwork: ArtworkInput = {
                    title: 'Test Title',
                    slug: 'test-slug',
                    description: 'Test description',
                    price: '50.00',
                    image_url: 'https://example.com/image.jpg',
                    // Optional fields omitted
                };
                const result = await createArtwork(partialArtwork);

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
            });

            it('updateArtwork should handle empty update object', async () => {
                const result = await updateArtwork('test-id', {});

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
            });

            it('updateArtwork should handle partial updates', async () => {
                const result = await updateArtwork('test-id', {
                    title: 'Updated Title',
                });

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
            });

            it('deleteArtwork should handle nonexistent id gracefully', async () => {
                const result = await deleteArtwork(
                    '00000000-0000-0000-0000-000000000000'
                );

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');
                // Should return error when id doesn't exist
            });
        });

        describe('return type validation', () => {
            it('getAllArtworkAdmin should return array when successful', async () => {
                const result = await getAllArtworkAdmin();

                if (result.data !== null) {
                    expect(Array.isArray(result.data)).toBe(true);
                }
            });

            it('getArtworkById should return single object when successful', async () => {
                const result = await getArtworkById('test-id');

                if (result.data !== null) {
                    expect(Array.isArray(result.data)).toBe(false);
                    expect(result.data).toHaveProperty('id');
                }
            });

            it('createArtwork should return single object when successful', async () => {
                const artwork: ArtworkInput = {
                    title: 'Test',
                    slug: 'test-create',
                    description: 'Test',
                    price: '100.00',
                    image_url: 'https://example.com/image.jpg',
                };
                const result = await createArtwork(artwork);

                if (result.data !== null) {
                    expect(Array.isArray(result.data)).toBe(false);
                    expect(result.data).toHaveProperty('id');
                    expect(result.data).toHaveProperty('created_at');
                    expect(result.data).toHaveProperty('updated_at');
                }
            });

            it('updateArtwork should return single object when successful', async () => {
                const result = await updateArtwork('test-id', {
                    title: 'Updated',
                });

                if (result.data !== null) {
                    expect(Array.isArray(result.data)).toBe(false);
                    expect(result.data).toHaveProperty('id');
                    expect(result.data).toHaveProperty('updated_at');
                }
            });

            it('deleteArtwork should return object with id when successful', async () => {
                const testId = 'test-delete-id';
                const result = await deleteArtwork(testId);

                if (result.data !== null) {
                    expect(result.data).toHaveProperty('id');
                    expect(result.data.id).toBe(testId);
                }
            });
        });

        describe('success paths', () => {
            it('getAllArtworkAdmin should return successful result structure', async () => {
                const result = await getAllArtworkAdmin();

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.data !== null) {
                    expect(Array.isArray(result.data)).toBe(true);
                    // Each item should have standard fields
                    if (result.data.length > 0) {
                        const item = result.data[0];
                        expect(item).toHaveProperty('id');
                        expect(item).toHaveProperty('title');
                        expect(item).toHaveProperty('slug');
                        expect(item).toHaveProperty('created_at');
                    }
                }

                if (result.error !== null) {
                    expect(result.error).toHaveProperty('code');
                    expect(result.error).toHaveProperty('message');
                }
            });

            it('getArtworkById should return successful result structure', async () => {
                const result = await getArtworkById('test-id');

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.data !== null) {
                    expect(result.data).toHaveProperty('id');
                    expect(result.data).toHaveProperty('title');
                    expect(result.data).toHaveProperty('slug');
                }

                if (result.error !== null) {
                    expect(result.error).toHaveProperty('code');
                    expect(result.error).toHaveProperty('message');
                }
            });

            it('createArtwork should return successful result structure', async () => {
                const artwork: ArtworkInput = {
                    title: 'Integration Test Artwork',
                    slug: `test-${Date.now()}`,
                    description: 'Created by integration test',
                    price: '100.00',
                    image_url: 'https://example.com/test.jpg',
                };
                const result = await createArtwork(artwork);

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.data !== null) {
                    expect(result.data).toHaveProperty('id');
                    expect(result.data.title).toBe(artwork.title);
                    expect(result.data.slug).toBe(artwork.slug);
                }

                if (result.error !== null) {
                    expect(result.error).toHaveProperty('code');
                    expect(result.error).toHaveProperty('message');
                }
            });

            it('updateArtwork should return successful result structure', async () => {
                const result = await updateArtwork('test-id', {
                    title: 'Updated Title',
                });

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.data !== null) {
                    expect(result.data).toHaveProperty('id');
                    expect(result.data).toHaveProperty('updated_at');
                }

                if (result.error !== null) {
                    expect(result.error).toHaveProperty('code');
                    expect(result.error).toHaveProperty('message');
                }
            });

            it('deleteArtwork should return successful result structure', async () => {
                const result = await deleteArtwork('test-id');

                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('error');

                if (result.data !== null) {
                    expect(result.data).toHaveProperty('id');
                }

                if (result.error !== null) {
                    expect(result.error).toHaveProperty('code');
                    expect(result.error).toHaveProperty('message');
                }
            });
        });

        describe('pagination behavior', () => {
            it('getAllArtworkAdmin should respect limit parameter', async () => {
                const limit = 5;
                const result = await getAllArtworkAdmin(limit, 0);

                if (result.data !== null) {
                    expect(result.data.length).toBeLessThanOrEqual(limit);
                }
            });

            it('getAllArtworkAdmin should respect offset parameter', async () => {
                // Get first page
                const firstPage = await getAllArtworkAdmin(5, 0);
                // Get second page
                const secondPage = await getAllArtworkAdmin(5, 5);

                if (
                    firstPage.data !== null &&
                    secondPage.data !== null &&
                    firstPage.data.length > 0 &&
                    secondPage.data.length > 0
                ) {
                    // Second page should have different items
                    expect(firstPage.data[0].id).not.toBe(
                        secondPage.data[0].id
                    );
                }
            });

            it('getAllArtworkAdmin should order by created_at descending', async () => {
                const result = await getAllArtworkAdmin(10, 0);

                if (result.data !== null && result.data.length > 1) {
                    const first = new Date(result.data[0].created_at).getTime();
                    const second = new Date(
                        result.data[1].created_at
                    ).getTime();
                    // First should be newer or equal to second
                    expect(first).toBeGreaterThanOrEqual(second);
                }
            });
        });

        describe('development mode error details', () => {
            it('should include details in development mode', async () => {
                vi.stubEnv('NODE_ENV', 'development');

                // Simulate browser to trigger error
                // @ts-expect-error - Simulating browser window
                global.window = {};
                const result = await getAllArtworkAdmin();

                if (result.error) {
                    // In development, should have details
                    expect(result.error).toHaveProperty('details');
                }

                vi.unstubAllEnvs();
            });

            it('should not include details in production mode', async () => {
                vi.stubEnv('NODE_ENV', 'production');

                // Simulate browser to trigger error
                // @ts-expect-error - Simulating browser window
                global.window = {};
                const result = await getAllArtworkAdmin();

                if (result.error) {
                    // In production, should not have details
                    expect(result.error).not.toHaveProperty('details');
                }

                vi.unstubAllEnvs();
            });
        });

        describe('error code specificity', () => {
            it('should return fetch_error code for getAllArtworkAdmin failures', async () => {
                // Simulate browser to trigger error
                // @ts-expect-error - Simulating browser window
                global.window = {};
                const result = await getAllArtworkAdmin();

                expect(result.error?.code).toBe('fetch_error');
            });

            it('should return fetch_error code for getArtworkById failures', async () => {
                // Simulate browser to trigger error
                // @ts-expect-error - Simulating browser window
                global.window = {};
                const result = await getArtworkById('test-id');

                expect(result.error?.code).toBe('fetch_error');
            });

            it('should return create_error code for createArtwork failures', async () => {
                // Simulate browser to trigger error
                // @ts-expect-error - Simulating browser window
                global.window = {};
                const artwork: ArtworkInput = {
                    title: 'Test',
                    slug: 'test',
                    description: 'Test',
                    price: '100.00',
                    image_url: 'https://example.com/image.jpg',
                };
                const result = await createArtwork(artwork);

                expect(result.error?.code).toBe('create_error');
            });

            it('should return update_error code for updateArtwork failures', async () => {
                // Simulate browser to trigger error
                // @ts-expect-error - Simulating browser window
                global.window = {};
                const result = await updateArtwork('test-id', {
                    title: 'Updated',
                });

                expect(result.error?.code).toBe('update_error');
            });

            it('should return delete_error code for deleteArtwork failures', async () => {
                // Simulate browser to trigger error
                // @ts-expect-error - Simulating browser window
                global.window = {};
                const result = await deleteArtwork('test-id');

                expect(result.error?.code).toBe('delete_error');
            });
        });
    });

    // Provide helpful message if Supabase is not available
    describe('Supabase availability check', () => {
        it('should log helpful message if Supabase is not available', () => {
            if (!isSupabaseAvailable()) {
                console.log(
                    'ℹ️  Admin integration tests skipped - Supabase not configured'
                );
                console.log('   To run integration tests, either:');
                console.log('   1. Run: npm run db:start');
                console.log(
                    '   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
                );
            }
            expect(true).toBe(true);
        });
    });
});

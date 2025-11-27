import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createArtworkAction,
    updateArtworkAction,
    deleteArtworkAction,
} from '@/app/admin/artwork/actions';
import * as artworkDb from '@/lib/db/admin/artwork';
import type { ArtworkAdminError } from '@/lib/db/admin/artwork';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ArtworkFormData } from '@/lib/validation/artwork';

// Mock Next.js modules
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(() => {
        // Next.js redirect throws a NEXT_REDIRECT error
        const error = new Error('NEXT_REDIRECT') as Error & {
            digest?: string;
        };
        error.digest = 'NEXT_REDIRECT';
        throw error;
    }),
}));

// Mock database functions
vi.mock('@/lib/db/admin/artwork', () => ({
    createArtwork: vi.fn(),
    updateArtwork: vi.fn(),
    deleteArtwork: vi.fn(),
}));

describe('Artwork Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const validArtworkData: ArtworkFormData = {
        title: 'Test Artwork',
        slug: 'test-artwork',
        description: 'Test Description',
        price: '100.00',
        original_price: null,
        sku: null,
        inventory_count: 1,
        is_limited_edition: false,
        medium: 'Digital',
        dimensions: null,
        year_created: 2024,
        image_url: 'https://example.com/image.jpg',
        image_thumbnail_url: 'https://example.com/thumb.jpg',
        image_large_url: null,
        is_published: true,
        is_featured: false,
        display_order: 1,
        alt_text: null,
        seo_title: null,
        seo_description: null,
        tags: null,
    };

    describe('createArtworkAction', () => {
        it('should create artwork successfully and redirect', async () => {
            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(createArtworkAction(validArtworkData)).rejects.toThrow(
                'NEXT_REDIRECT'
            );

            expect(artworkDb.createArtwork).toHaveBeenCalledWith(
                validArtworkData
            );
            expect(revalidatePath).toHaveBeenCalledWith('/admin/artwork');
            expect(revalidatePath).toHaveBeenCalledWith('/gallery');
            expect(revalidatePath).toHaveBeenCalledWith('/shoppe');
            expect(redirect).toHaveBeenCalledWith('/admin/artwork');
        });

        it('should throw error when database operation fails', async () => {
            const dbError: ArtworkAdminError = {
                code: 'connection_error',
                message: 'Database connection failed',
            };
            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error: dbError,
            });

            await expect(createArtworkAction(validArtworkData)).rejects.toThrow(
                'Database connection failed'
            );

            expect(artworkDb.createArtwork).toHaveBeenCalledWith(
                validArtworkData
            );
            expect(revalidatePath).not.toHaveBeenCalled();
            expect(redirect).not.toHaveBeenCalled();
        });

        it('should revalidate all required paths', async () => {
            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(createArtworkAction(validArtworkData)).rejects.toThrow(
                'NEXT_REDIRECT'
            );

            expect(revalidatePath).toHaveBeenCalledTimes(3);
            expect(revalidatePath).toHaveBeenCalledWith('/admin/artwork');
            expect(revalidatePath).toHaveBeenCalledWith('/gallery');
            expect(revalidatePath).toHaveBeenCalledWith('/shoppe');
        });

        it('should handle null category ID', async () => {
            const dataWithNullCategory = {
                ...validArtworkData,
                categoryId: null,
            };

            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(
                createArtworkAction(dataWithNullCategory)
            ).rejects.toThrow('NEXT_REDIRECT');

            expect(artworkDb.createArtwork).toHaveBeenCalledWith(
                dataWithNullCategory
            );
        });

        it('should handle category ID when provided', async () => {
            const dataWithCategory = {
                ...validArtworkData,
                categoryId: 'category-uuid-123',
            };

            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(createArtworkAction(dataWithCategory)).rejects.toThrow(
                'NEXT_REDIRECT'
            );

            expect(artworkDb.createArtwork).toHaveBeenCalledWith(
                dataWithCategory
            );
        });
    });

    describe('updateArtworkAction', () => {
        const artworkId = 'artwork-uuid-123';

        it('should update artwork successfully and redirect', async () => {
            vi.mocked(artworkDb.updateArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(
                updateArtworkAction(artworkId, validArtworkData)
            ).rejects.toThrow('NEXT_REDIRECT');

            expect(artworkDb.updateArtwork).toHaveBeenCalledWith(
                artworkId,
                validArtworkData
            );
            expect(revalidatePath).toHaveBeenCalledWith('/admin/artwork');
            expect(revalidatePath).toHaveBeenCalledWith(
                `/admin/artwork/${artworkId}`
            );
            expect(revalidatePath).toHaveBeenCalledWith('/gallery');
            expect(revalidatePath).toHaveBeenCalledWith('/shoppe');
            expect(redirect).toHaveBeenCalledWith('/admin/artwork');
        });

        it('should throw error when database operation fails', async () => {
            const dbError: ArtworkAdminError = {
                code: 'update_failed',
                message: 'Update failed',
            };
            vi.mocked(artworkDb.updateArtwork).mockResolvedValue({
                data: null,
                error: dbError,
            });

            await expect(
                updateArtworkAction(artworkId, validArtworkData)
            ).rejects.toThrow('Update failed');

            expect(artworkDb.updateArtwork).toHaveBeenCalledWith(
                artworkId,
                validArtworkData
            );
            expect(revalidatePath).not.toHaveBeenCalled();
            expect(redirect).not.toHaveBeenCalled();
        });

        it('should revalidate all required paths including specific artwork page', async () => {
            vi.mocked(artworkDb.updateArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(
                updateArtworkAction(artworkId, validArtworkData)
            ).rejects.toThrow('NEXT_REDIRECT');

            expect(revalidatePath).toHaveBeenCalledTimes(4);
            expect(revalidatePath).toHaveBeenCalledWith('/admin/artwork');
            expect(revalidatePath).toHaveBeenCalledWith(
                `/admin/artwork/${artworkId}`
            );
            expect(revalidatePath).toHaveBeenCalledWith('/gallery');
            expect(revalidatePath).toHaveBeenCalledWith('/shoppe');
        });

        it('should handle artwork not found error', async () => {
            const notFoundError: ArtworkAdminError = {
                code: 'not_found',
                message: 'Artwork not found',
            };
            vi.mocked(artworkDb.updateArtwork).mockResolvedValue({
                data: null,
                error: notFoundError,
            });

            await expect(
                updateArtworkAction('non-existent-id', validArtworkData)
            ).rejects.toThrow('Artwork not found');

            expect(artworkDb.updateArtwork).toHaveBeenCalledWith(
                'non-existent-id',
                validArtworkData
            );
        });

        it('should handle partial data updates', async () => {
            const partialData: ArtworkFormData = {
                ...validArtworkData,
                price: '200.00',
                is_published: false,
            };

            vi.mocked(artworkDb.updateArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(
                updateArtworkAction(artworkId, partialData)
            ).rejects.toThrow('NEXT_REDIRECT');

            expect(artworkDb.updateArtwork).toHaveBeenCalledWith(
                artworkId,
                partialData
            );
        });
    });

    describe('deleteArtworkAction', () => {
        const artworkId = 'artwork-uuid-456';

        it('should delete artwork successfully without redirecting', async () => {
            vi.mocked(artworkDb.deleteArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await deleteArtworkAction(artworkId);

            expect(artworkDb.deleteArtwork).toHaveBeenCalledWith(artworkId);
            expect(revalidatePath).toHaveBeenCalledWith('/admin/artwork');
            expect(revalidatePath).toHaveBeenCalledWith('/gallery');
            expect(revalidatePath).toHaveBeenCalledWith('/shoppe');
            expect(redirect).not.toHaveBeenCalled();
        });

        it('should throw error when database operation fails', async () => {
            const dbError: ArtworkAdminError = {
                code: 'delete_failed',
                message: 'Delete failed',
            };
            vi.mocked(artworkDb.deleteArtwork).mockResolvedValue({
                data: null,
                error: dbError,
            });

            await expect(deleteArtworkAction(artworkId)).rejects.toThrow(
                'Delete failed'
            );

            expect(artworkDb.deleteArtwork).toHaveBeenCalledWith(artworkId);
            expect(revalidatePath).not.toHaveBeenCalled();
        });

        it('should revalidate all required paths', async () => {
            vi.mocked(artworkDb.deleteArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await deleteArtworkAction(artworkId);

            expect(revalidatePath).toHaveBeenCalledTimes(3);
            expect(revalidatePath).toHaveBeenCalledWith('/admin/artwork');
            expect(revalidatePath).toHaveBeenCalledWith('/gallery');
            expect(revalidatePath).toHaveBeenCalledWith('/shoppe');
        });

        it('should handle artwork not found error', async () => {
            const notFoundError: ArtworkAdminError = {
                code: 'not_found',
                message: 'Artwork not found',
            };
            vi.mocked(artworkDb.deleteArtwork).mockResolvedValue({
                data: null,
                error: notFoundError,
            });

            await expect(
                deleteArtworkAction('non-existent-id')
            ).rejects.toThrow('Artwork not found');

            expect(artworkDb.deleteArtwork).toHaveBeenCalledWith(
                'non-existent-id'
            );
        });

        it('should not redirect after successful deletion', async () => {
            vi.mocked(artworkDb.deleteArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await deleteArtworkAction(artworkId);

            expect(redirect).not.toHaveBeenCalled();
        });

        it('should handle database constraint errors', async () => {
            const constraintError: ArtworkAdminError = {
                code: 'constraint_violation',
                message: 'Cannot delete: artwork has related orders',
            };
            vi.mocked(artworkDb.deleteArtwork).mockResolvedValue({
                data: null,
                error: constraintError,
            });

            await expect(deleteArtworkAction(artworkId)).rejects.toThrow(
                'Cannot delete: artwork has related orders'
            );
        });
    });

    describe('Error Message Handling', () => {
        it('should preserve error message details from database', async () => {
            const specificError: ArtworkAdminError = {
                code: 'constraint_error',
                message: 'Foreign key constraint violation',
            };
            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error: specificError,
            });

            await expect(createArtworkAction(validArtworkData)).rejects.toThrow(
                'Foreign key constraint violation'
            );
        });

        it('should handle database timeout errors', async () => {
            const timeoutError: ArtworkAdminError = {
                code: 'timeout_error',
                message: 'Query timeout exceeded',
            };
            vi.mocked(artworkDb.updateArtwork).mockResolvedValue({
                data: null,
                error: timeoutError,
            });

            await expect(
                updateArtworkAction('id-123', validArtworkData)
            ).rejects.toThrow('Query timeout exceeded');
        });

        it('should handle permission errors', async () => {
            const permissionError: ArtworkAdminError = {
                code: 'permission_denied',
                message: 'Insufficient permissions',
            };
            vi.mocked(artworkDb.deleteArtwork).mockResolvedValue({
                data: null,
                error: permissionError,
            });

            await expect(deleteArtworkAction('id-123')).rejects.toThrow(
                'Insufficient permissions'
            );
        });
    });

    describe('Path Revalidation Behavior', () => {
        it('should only revalidate paths after successful database operation', async () => {
            const error: ArtworkAdminError = {
                code: 'database_error',
                message: 'Database error',
            };
            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error,
            });

            await expect(
                createArtworkAction(validArtworkData)
            ).rejects.toThrow();

            expect(revalidatePath).not.toHaveBeenCalled();
        });

        it('should revalidate paths in correct order for create', async () => {
            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(createArtworkAction(validArtworkData)).rejects.toThrow(
                'NEXT_REDIRECT'
            );

            const calls = vi.mocked(revalidatePath).mock.calls;
            expect(calls[0][0]).toBe('/admin/artwork');
            expect(calls[1][0]).toBe('/gallery');
            expect(calls[2][0]).toBe('/shoppe');
        });

        it('should revalidate paths in correct order for update', async () => {
            const artworkId = 'test-id';
            vi.mocked(artworkDb.updateArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(
                updateArtworkAction(artworkId, validArtworkData)
            ).rejects.toThrow('NEXT_REDIRECT');

            const calls = vi.mocked(revalidatePath).mock.calls;
            expect(calls[0][0]).toBe('/admin/artwork');
            expect(calls[1][0]).toBe(`/admin/artwork/${artworkId}`);
            expect(calls[2][0]).toBe('/gallery');
            expect(calls[3][0]).toBe('/shoppe');
        });

        it('should revalidate paths in correct order for delete', async () => {
            vi.mocked(artworkDb.deleteArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await deleteArtworkAction('test-id');

            const calls = vi.mocked(revalidatePath).mock.calls;
            expect(calls[0][0]).toBe('/admin/artwork');
            expect(calls[1][0]).toBe('/gallery');
            expect(calls[2][0]).toBe('/shoppe');
        });
    });

    describe('Redirect Behavior', () => {
        it('should redirect to /admin/artwork after create', async () => {
            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(createArtworkAction(validArtworkData)).rejects.toThrow(
                'NEXT_REDIRECT'
            );

            expect(redirect).toHaveBeenCalledWith('/admin/artwork');
            expect(redirect).toHaveBeenCalledTimes(1);
        });

        it('should redirect to /admin/artwork after update', async () => {
            vi.mocked(artworkDb.updateArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await expect(
                updateArtworkAction('test-id', validArtworkData)
            ).rejects.toThrow('NEXT_REDIRECT');

            expect(redirect).toHaveBeenCalledWith('/admin/artwork');
            expect(redirect).toHaveBeenCalledTimes(1);
        });

        it('should not redirect after delete', async () => {
            vi.mocked(artworkDb.deleteArtwork).mockResolvedValue({
                data: null,
                error: null,
            });

            await deleteArtworkAction('test-id');

            expect(redirect).not.toHaveBeenCalled();
        });

        it('should not redirect if database operation fails', async () => {
            const error: ArtworkAdminError = {
                code: 'operation_failed',
                message: 'Failed',
            };
            vi.mocked(artworkDb.createArtwork).mockResolvedValue({
                data: null,
                error,
            });

            await expect(createArtworkAction(validArtworkData)).rejects.toThrow(
                'Failed'
            );

            expect(redirect).not.toHaveBeenCalled();
        });
    });
});

// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createArtwork,
    deleteArtwork,
    getAllArtworkAdmin,
    getArtworkById,
    updateArtwork,
    type ArtworkInput,
} from '@/lib/db/admin/artwork';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createServiceRoleClient: vi.fn(),
}));

describe('Admin Artwork Queries', () => {
    const mockSupabase = {
        from: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof createServiceRoleClient>>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createServiceRoleClient).mockResolvedValue(mockSupabase);
    });

    describe('getAllArtworkAdmin', () => {
        it('returns all artwork without is_published filter', async () => {
            const mockData = [{ id: '1', title: 'Test Art' }];
            const mockSelect = vi.fn().mockReturnThis();
            const mockRange = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
                count: 1,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                range: mockRange,
            });
            mockRange.mockReturnValue({
                order: mockOrder,
            });

            const result = await getAllArtworkAdmin();

            expect(createServiceRoleClient).toHaveBeenCalled();
            expect(mockSupabase.from).toHaveBeenCalledWith('artwork');
            expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('handles pagination', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockRange = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockResolvedValue({
                data: [],
                error: null,
                count: 0,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                range: mockRange,
            });
            mockRange.mockReturnValue({
                order: mockOrder,
            });

            await getAllArtworkAdmin(10, 20);

            expect(mockRange).toHaveBeenCalledWith(20, 29);
        });

        it('returns error on failure', async () => {
            const mockError = { code: '500', message: 'DB Error' };
            const mockSelect = vi.fn().mockReturnThis();
            const mockRange = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
                count: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                range: mockRange,
            });
            mockRange.mockReturnValue({
                order: mockOrder,
            });

            const result = await getAllArtworkAdmin();

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: '500',
                message: 'DB Error',
            });
        });
    });

    describe('getArtworkById', () => {
        it('returns single artwork by UUID', async () => {
            const mockData = { id: '123', title: 'Test Art' };
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                single: mockSingle,
            });

            const result = await getArtworkById('123');

            expect(mockSupabase.from).toHaveBeenCalledWith('artwork');
            expect(mockEq).toHaveBeenCalledWith('id', '123');
            expect(result.data).toEqual(mockData);
        });
    });

    describe('createArtwork', () => {
        it('inserts new artwork', async () => {
            const newArt = { title: 'New Art', slug: 'new-art' };
            const mockData = { id: '1', ...newArt };
            const mockInsert = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                insert: mockInsert,
            });
            mockInsert.mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await createArtwork(newArt as ArtworkInput);

            expect(mockSupabase.from).toHaveBeenCalledWith('artwork');
            expect(mockInsert).toHaveBeenCalledWith(newArt);
            expect(result.data).toEqual(mockData);
        });
    });

    describe('updateArtwork', () => {
        it('updates existing artwork', async () => {
            const updates = { title: 'Updated Art' };
            const mockData = { id: '1', title: 'Updated Art' };
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                update: mockUpdate,
            });
            mockUpdate.mockReturnValue({
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await updateArtwork('1', updates);

            expect(mockSupabase.from).toHaveBeenCalledWith('artwork');
            expect(mockUpdate).toHaveBeenCalledWith(updates);
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(result.data).toEqual(mockData);
        });
    });

    describe('deleteArtwork', () => {
        it('deletes artwork', async () => {
            const mockDelete = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: { id: '1' },
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                delete: mockDelete,
            });
            mockDelete.mockReturnValue({
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await deleteArtwork('1');

            expect(mockSupabase.from).toHaveBeenCalledWith('artwork');
            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(result.data).toEqual({ id: '1' });
        });
    });
});

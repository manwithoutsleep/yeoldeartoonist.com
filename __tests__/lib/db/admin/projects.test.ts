// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createProject,
    deleteProject,
    getAllProjectsAdmin,
    getProjectById,
    updateProject,
    type ProjectInput,
} from '@/lib/db/admin/projects';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createServiceRoleClient: vi.fn(),
}));

describe('Admin Project Queries', () => {
    const mockSupabase = {
        from: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof createServiceRoleClient>>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createServiceRoleClient).mockResolvedValue(mockSupabase);
    });

    describe('getAllProjectsAdmin', () => {
        it('returns all projects without is_published filter', async () => {
            const mockData = [
                {
                    id: '1',
                    title: 'Test Project',
                    slug: 'test-project',
                    description: 'A test project',
                    status: 'active' as const,
                    progress_percentage: 50,
                    expected_completion_date: null,
                    image_url: null,
                    is_published: true,
                    display_order: 0,
                    created_at: '2025-01-01',
                    updated_at: '2025-01-01',
                },
            ];
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

            const result = await getAllProjectsAdmin();

            expect(createServiceRoleClient).toHaveBeenCalled();
            expect(mockSupabase.from).toHaveBeenCalledWith('projects');
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

            await getAllProjectsAdmin(10, 20);

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

            const result = await getAllProjectsAdmin();

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });

        it('throws error when called from client side', async () => {
            // Simulate browser environment
            const originalWindow = global.window;
            // @ts-expect-error Setting window for test
            global.window = {};

            const result = await getAllProjectsAdmin();

            expect(result.data).toBeNull();
            expect(result.error?.code).toBe('fetch_error');

            // Restore
            global.window = originalWindow;
        });
    });

    describe('getProjectById', () => {
        it('returns single project by ID', async () => {
            const mockData = {
                id: '123',
                title: 'Test Project',
                slug: 'test-project',
                description: 'A test project',
                status: 'active' as const,
                progress_percentage: 50,
                expected_completion_date: null,
                image_url: null,
                is_published: true,
                display_order: 0,
                created_at: '2025-01-01',
                updated_at: '2025-01-01',
            };
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

            const result = await getProjectById('123');

            expect(mockSupabase.from).toHaveBeenCalledWith('projects');
            expect(mockEq).toHaveBeenCalledWith('id', '123');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('returns error when project not found', async () => {
            const mockError = { code: 'PGRST116', message: 'Not found' };
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
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

            const result = await getProjectById('999');

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });
    });

    describe('createProject', () => {
        it('creates new project with valid data', async () => {
            const newProject: ProjectInput = {
                title: 'New Project',
                slug: 'new-project',
                description: 'A new project',
                status: 'planning',
                progress_percentage: 0,
                is_published: false,
                display_order: 0,
            };
            const mockData = { id: '123', ...newProject };
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

            const result = await createProject(newProject);

            expect(mockSupabase.from).toHaveBeenCalledWith('projects');
            expect(mockInsert).toHaveBeenCalledWith(newProject);
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('returns error on creation failure', async () => {
            const mockError = { code: '23505', message: 'Duplicate slug' };
            const mockInsert = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
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

            const result = await createProject({
                title: 'Test',
                slug: 'test',
                description: 'Test',
            });

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });
    });

    describe('updateProject', () => {
        it('updates existing project with partial data', async () => {
            const updates = {
                title: 'Updated Title',
                status: 'completed' as const,
            };
            const mockData = {
                id: '123',
                ...updates,
                slug: 'test',
                description: 'Test',
            };
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

            const result = await updateProject('123', updates);

            expect(mockSupabase.from).toHaveBeenCalledWith('projects');
            expect(mockUpdate).toHaveBeenCalledWith(updates);
            expect(mockEq).toHaveBeenCalledWith('id', '123');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('returns error on update failure', async () => {
            const mockError = { code: '404', message: 'Not found' };
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
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

            const result = await updateProject('999', { title: 'New' });

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });
    });

    describe('deleteProject', () => {
        it('deletes project by ID', async () => {
            const mockDelete = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: { id: '123' },
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

            const result = await deleteProject('123');

            expect(mockSupabase.from).toHaveBeenCalledWith('projects');
            expect(mockEq).toHaveBeenCalledWith('id', '123');
            expect(result.data).toEqual({ id: '123' });
            expect(result.error).toBeNull();
        });

        it('returns error on deletion failure', async () => {
            const mockError = { code: '404', message: 'Not found' };
            const mockDelete = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
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

            const result = await deleteProject('999');

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });
    });
});

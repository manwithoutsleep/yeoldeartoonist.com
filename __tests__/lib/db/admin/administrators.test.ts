// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createAdmin,
    deactivateAdmin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    type AdminRow,
} from '@/lib/db/admin/administrators';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { AuthError, User } from '@supabase/supabase-js';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createServiceRoleClient: vi.fn(),
}));

describe('Admin Administrators Database Queries', () => {
    const mockSupabase = {
        from: vi.fn(),
        auth: {
            admin: {
                createUser: vi.fn(),
                deleteUser: vi.fn(),
            },
        },
    } as unknown as Awaited<ReturnType<typeof createServiceRoleClient>>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createServiceRoleClient).mockResolvedValue(mockSupabase);
    });

    describe('getAllAdmins', () => {
        it('should return all administrators including inactive', async () => {
            const mockData: AdminRow[] = [
                {
                    id: '1',
                    auth_id: 'auth-1',
                    name: 'Active Admin',
                    email: 'active@example.com',
                    role: 'admin',
                    is_active: true,
                    created_at: '2025-01-01',
                    updated_at: '2025-01-01',
                },
                {
                    id: '2',
                    auth_id: 'auth-2',
                    name: 'Inactive Admin',
                    email: 'inactive@example.com',
                    role: 'super_admin',
                    is_active: false,
                    created_at: '2025-01-01',
                    updated_at: '2025-01-01',
                },
            ];

            const mockSelect = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                order: mockOrder,
            });

            const result = await getAllAdmins();

            expect(createServiceRoleClient).toHaveBeenCalled();
            expect(mockSupabase.from).toHaveBeenCalledWith('administrators');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('should return empty array when no admins exist', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockResolvedValue({
                data: [],
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                order: mockOrder,
            });

            const result = await getAllAdmins();

            expect(result.error).toBeNull();
            expect(result.data).toEqual([]);
        });

        it('should handle database errors', async () => {
            const mockError = { code: '500', message: 'DB Error' };
            const mockSelect = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                order: mockOrder,
            });

            const result = await getAllAdmins();

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe('500');
            expect(result.error?.message).toBe('DB Error');
        });
    });

    describe('getAdminById', () => {
        it('should return admin by UUID', async () => {
            const mockData: AdminRow = {
                id: '1',
                auth_id: 'auth-1',
                name: 'Test Admin',
                email: 'test@example.com',
                role: 'admin',
                is_active: true,
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

            const result = await getAdminById('1');

            expect(mockSupabase.from).toHaveBeenCalledWith('administrators');
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('should return error if admin not found', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
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

            const result = await getAdminById('fake-id');

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe('not_found');
        });
    });

    describe('createAdmin', () => {
        it('should create admin user with Supabase Auth and DB record', async () => {
            const mockAuthUser: User = {
                id: 'auth-id-123',
                email: 'new@example.com',
                app_metadata: {},
                user_metadata: {},
                aud: 'authenticated',
                created_at: '2025-01-01T00:00:00Z',
            };

            const mockAdmin: AdminRow = {
                id: 'admin-id-123',
                auth_id: 'auth-id-123',
                name: 'New Admin',
                email: 'new@example.com',
                role: 'admin',
                is_active: true,
                created_at: '2025-01-01',
                updated_at: '2025-01-01',
            };

            vi.mocked(mockSupabase.auth.admin.createUser).mockResolvedValue({
                data: { user: mockAuthUser },
                error: null,
            });

            const mockInsert = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockAdmin,
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

            const result = await createAdmin({
                name: 'New Admin',
                email: 'new@example.com',
                role: 'admin',
                password: 'password123',
            });

            expect(mockSupabase.auth.admin.createUser).toHaveBeenCalledWith({
                email: 'new@example.com',
                password: 'password123',
                email_confirm: true,
            });
            expect(result.data).toEqual(mockAdmin);
            expect(result.error).toBeNull();
        });

        it('should return error if email already exists', async () => {
            vi.mocked(mockSupabase.auth.admin.createUser).mockResolvedValue({
                data: { user: null },
                error: {
                    code: 'email_exists',
                    message: 'Email already registered',
                    name: 'AuthError',
                    status: 400,
                } as AuthError,
            });

            const result = await createAdmin({
                name: 'Test',
                email: 'exists@example.com',
                role: 'admin',
                password: 'password123',
            });

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe('email_exists');
        });

        it('should rollback auth user if DB insert fails', async () => {
            const mockAuthUser: User = {
                id: 'auth-id-123',
                email: 'new@example.com',
                app_metadata: {},
                user_metadata: {},
                aud: 'authenticated',
                created_at: '2025-01-01T00:00:00Z',
            };

            vi.mocked(mockSupabase.auth.admin.createUser).mockResolvedValue({
                data: { user: mockAuthUser },
                error: null,
            });

            const mockInsert = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'db_error', message: 'Insert failed' },
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

            const result = await createAdmin({
                name: 'Test',
                email: 'test@example.com',
                role: 'admin',
                password: 'password123',
            });

            expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalledWith(
                'auth-id-123'
            );
            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
        });

        it('should validate role (only admin or super_admin)', async () => {
            const result = await createAdmin({
                name: 'Test',
                email: 'test@example.com',
                role: 'invalid_role' as 'admin' | 'super_admin',
                password: 'password123',
            });

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe('invalid_role');
        });
    });

    describe('updateAdmin', () => {
        it('should update admin name', async () => {
            const mockUpdated: AdminRow = {
                id: '1',
                auth_id: 'auth-1',
                name: 'Updated Name',
                email: 'test@example.com',
                role: 'admin',
                is_active: true,
                created_at: '2025-01-01',
                updated_at: '2025-01-02',
            };

            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockUpdated,
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

            const result = await updateAdmin('1', { name: 'Updated Name' });

            expect(mockUpdate).toHaveBeenCalledWith({ name: 'Updated Name' });
            expect(result.data).toEqual(mockUpdated);
            expect(result.error).toBeNull();
        });

        it('should update admin role', async () => {
            const mockUpdated: AdminRow = {
                id: '1',
                auth_id: 'auth-1',
                name: 'Test Admin',
                email: 'test@example.com',
                role: 'super_admin',
                is_active: true,
                created_at: '2025-01-01',
                updated_at: '2025-01-02',
            };

            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockUpdated,
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

            const result = await updateAdmin('1', { role: 'super_admin' });

            expect(result.data?.role).toBe('super_admin');
            expect(result.error).toBeNull();
        });

        it('should return error if admin not found', async () => {
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
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

            const result = await updateAdmin('fake-id', { name: 'Updated' });

            expect(result.data).toBeNull();
            expect(result.error?.code).toBe('not_found');
        });

        it('should validate role when updating', async () => {
            const result = await updateAdmin('1', {
                role: 'invalid_role' as 'admin' | 'super_admin',
            });

            expect(result.data).toBeNull();
            expect(result.error?.code).toBe('invalid_role');
        });
    });

    describe('deactivateAdmin', () => {
        it('should set is_active to false', async () => {
            const mockDeactivated: AdminRow = {
                id: '1',
                auth_id: 'auth-1',
                name: 'Test Admin',
                email: 'test@example.com',
                role: 'admin',
                is_active: false,
                created_at: '2025-01-01',
                updated_at: '2025-01-02',
            };

            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockDeactivated,
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

            const result = await deactivateAdmin('1');

            expect(mockUpdate).toHaveBeenCalledWith({ is_active: false });
            expect(result.data?.is_active).toBe(false);
            expect(result.error).toBeNull();
        });

        it('should return error if admin not found', async () => {
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
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

            const result = await deactivateAdmin('fake-id');

            expect(result.data).toBeNull();
            expect(result.error?.code).toBe('not_found');
        });
    });

    describe('server-side only enforcement', () => {
        it('should return error if called from client', async () => {
            // Mock window object to simulate client environment
            (global as { window?: Window }).window = {} as Window &
                typeof globalThis;

            const result = await getAllAdmins();

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe('fetch_error');

            // Clean up
            delete (global as { window?: Window }).window;
        });
    });

    describe('error handling', () => {
        it('should return error object with code and message', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
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

            const result = await getAdminById('fake-id');

            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error).toHaveProperty('code');
            expect(result.error).toHaveProperty('message');
            expect(typeof result.error?.code).toBe('string');
            expect(typeof result.error?.message).toBe('string');
        });

        it('should never throw exceptions', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
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

            await expect(getAdminById('fake-id')).resolves.toBeDefined();
            await expect(
                updateAdmin('fake-id', { name: 'Test' })
            ).resolves.toBeDefined();
            await expect(deactivateAdmin('fake-id')).resolves.toBeDefined();
        });
    });
});

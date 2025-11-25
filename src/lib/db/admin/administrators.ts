import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type AdminRow = Database['public']['Tables']['administrators']['Row'];
export type AdminInsert =
    Database['public']['Tables']['administrators']['Insert'];
export type AdminUpdate =
    Database['public']['Tables']['administrators']['Update'];

export interface AdministratorError {
    code: string;
    message: string;
    details?: string;
}

export interface CreateAdminInput {
    name: string;
    email: string;
    role: 'admin' | 'super_admin';
    password: string;
}

export interface UpdateAdminInput {
    name?: string;
    role?: 'admin' | 'super_admin';
    is_active?: boolean;
}

/**
 * Get all administrators (including inactive)
 * @returns Promise with array of all administrators or error
 */
export async function getAllAdmins(): Promise<{
    data: AdminRow[] | null;
    error: AdministratorError | null;
}> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('administrators')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data: data || [], error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to fetch administrators',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get administrator by ID
 * @param id - Administrator UUID
 * @returns Promise with administrator data or error
 */
export async function getAdminById(id: string): Promise<{
    data: AdminRow | null;
    error: AdministratorError | null;
}> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('administrators')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return {
                    data: null,
                    error: {
                        code: 'not_found',
                        message: 'Administrator not found',
                    },
                };
            }

            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to fetch administrator',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Create new administrator
 * Two-step process:
 * 1. Create Supabase Auth user
 * 2. Create administrators record
 * If step 2 fails, attempts to rollback step 1
 *
 * @param data - Admin creation data
 * @returns Promise with created admin or error
 */
export async function createAdmin(
    data: CreateAdminInput
): Promise<{ data: AdminRow | null; error: AdministratorError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        // Validate role
        if (data.role !== 'admin' && data.role !== 'super_admin') {
            return {
                data: null,
                error: {
                    code: 'invalid_role',
                    message: 'Role must be admin or super_admin',
                },
            };
        }

        const supabase = await createServiceRoleClient();

        // Step 1: Create Supabase Auth user
        const { data: authUser, error: authError } =
            await supabase.auth.admin.createUser({
                email: data.email,
                password: data.password,
                email_confirm: true, // Skip email verification
            });

        if (authError) {
            return {
                data: null,
                error: {
                    code: authError.code || 'auth_error',
                    message: authError.message,
                },
            };
        }

        if (!authUser.user) {
            return {
                data: null,
                error: {
                    code: 'auth_error',
                    message: 'Failed to create auth user',
                },
            };
        }

        // Step 2: Create administrators record
        const { data: admin, error: dbError } = await supabase
            .from('administrators')
            .insert({
                auth_id: authUser.user.id,
                name: data.name,
                email: data.email,
                role: data.role,
                is_active: true,
            })
            .select()
            .single();

        if (dbError) {
            // Rollback: Delete auth user
            await supabase.auth.admin.deleteUser(authUser.user.id);

            return {
                data: null,
                error: {
                    code: dbError.code,
                    message: dbError.message,
                },
            };
        }

        return { data: admin, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'create_error',
                message: 'Failed to create administrator',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Update administrator
 * @param id - Administrator UUID
 * @param data - Partial admin update data
 * @returns Promise with updated admin or error
 */
export async function updateAdmin(
    id: string,
    data: UpdateAdminInput
): Promise<{ data: AdminRow | null; error: AdministratorError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        // Validate role if provided
        if (data.role && data.role !== 'admin' && data.role !== 'super_admin') {
            return {
                data: null,
                error: {
                    code: 'invalid_role',
                    message: 'Role must be admin or super_admin',
                },
            };
        }

        const supabase = await createServiceRoleClient();
        const { data: admin, error } = await supabase
            .from('administrators')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return {
                    data: null,
                    error: {
                        code: 'not_found',
                        message: 'Administrator not found',
                    },
                };
            }

            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data: admin, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'update_error',
                message: 'Failed to update administrator',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Deactivate administrator (soft delete)
 * Sets is_active to false without deleting the record
 * @param id - Administrator UUID
 * @returns Promise with deactivated admin or error
 */
export async function deactivateAdmin(id: string): Promise<{
    data: AdminRow | null;
    error: AdministratorError | null;
}> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data: admin, error } = await supabase
            .from('administrators')
            .update({ is_active: false })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return {
                    data: null,
                    error: {
                        code: 'not_found',
                        message: 'Administrator not found',
                    },
                };
            }

            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data: admin, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'deactivate_error',
                message: 'Failed to deactivate administrator',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

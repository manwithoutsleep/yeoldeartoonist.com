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
        if (process.env.NODE_ENV === 'development') {
            console.log('[updateAdmin] Called with id:', id);
            console.log('[updateAdmin] data:', data);
            console.log('[updateAdmin] typeof id:', typeof id);
        }

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

        // If password is being updated, we need to get the auth_id first
        const password = ('password' in data ? data.password : undefined) as
            | string
            | undefined;
        if (password) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[updateAdmin] Password change requested');
            }

            // Get the admin record to find auth_id
            const { data: existingAdmin, error: fetchError } = await supabase
                .from('administrators')
                .select('auth_id')
                .eq('id', id)
                .single();

            if (fetchError || !existingAdmin) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(
                        '[updateAdmin] Failed to fetch admin for auth update:',
                        fetchError
                    );
                }
                return {
                    data: null,
                    error: {
                        code: 'not_found',
                        message: 'Administrator not found',
                    },
                };
            }

            // Update Supabase Auth password
            if (process.env.NODE_ENV === 'development') {
                console.log(
                    '[updateAdmin] Updating auth password for auth_id:',
                    existingAdmin.auth_id
                );
            }
            const { error: authError } =
                await supabase.auth.admin.updateUserById(
                    existingAdmin.auth_id,
                    { password }
                );

            if (authError) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(
                        '[updateAdmin] Auth password update failed:',
                        authError
                    );
                }
                return {
                    data: null,
                    error: {
                        code: 'auth_update_error',
                        message: 'Failed to update password',
                        details: authError.message,
                    },
                };
            }

            if (process.env.NODE_ENV === 'development') {
                console.log('[updateAdmin] Auth password updated successfully');
            }
        }

        // Remove password fields from data before updating administrators table
        // (password is only stored in Supabase Auth, not in the administrators table)
        const dbData: Partial<UpdateAdminInput> = {};
        if (data.name !== undefined) dbData.name = data.name;
        if (data.role !== undefined) dbData.role = data.role;
        if (data.is_active !== undefined) dbData.is_active = data.is_active;

        if (process.env.NODE_ENV === 'development') {
            console.log(
                '[updateAdmin] About to update administrators table with:',
                { id, dbData }
            );
        }

        const { data: admin, error } = await supabase
            .from('administrators')
            .update(dbData)
            .eq('id', id)
            .select()
            .single();

        if (process.env.NODE_ENV === 'development') {
            console.log('[updateAdmin] Query result - admin:', admin);
            console.log('[updateAdmin] Query result - error:', error);
        }

        if (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[updateAdmin] Error code:', error.code);
                console.log('[updateAdmin] Error message:', error.message);
                console.log(
                    '[updateAdmin] Full error:',
                    JSON.stringify(error, null, 2)
                );
            }

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
        if (process.env.NODE_ENV === 'development') {
            console.log('[updateAdmin] Exception:', err);
        }
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

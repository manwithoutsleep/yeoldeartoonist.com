import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type ProjectInput = Database['public']['Tables']['projects']['Insert'];
export type ProjectRow = Database['public']['Tables']['projects']['Row'];

export interface ProjectAdminError {
    code: string;
    message: string;
    details?: string;
}

export async function getAllProjectsAdmin(
    limit: number = 50,
    offset: number = 0
): Promise<{ data: ProjectRow[] | null; error: ProjectAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('projects')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
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

        return { data, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to fetch projects',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function getProjectById(
    id: string
): Promise<{ data: ProjectRow | null; error: ProjectAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
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
                message: 'Failed to fetch project',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function createProject(
    project: ProjectInput
): Promise<{ data: ProjectRow | null; error: ProjectAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('projects')
            .insert(project)
            .select()
            .single();

        if (error) {
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
                code: 'create_error',
                message: 'Failed to create project',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function updateProject(
    id: string,
    project: Partial<ProjectInput>
): Promise<{ data: ProjectRow | null; error: ProjectAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('projects')
            .update(project)
            .eq('id', id)
            .select()
            .single();

        if (error) {
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
                code: 'update_error',
                message: 'Failed to update project',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function deleteProject(
    id: string
): Promise<{ data: { id: string } | null; error: ProjectAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code,
                    message: error.message,
                },
            };
        }

        return { data: { id }, error: null };
    } catch (err) {
        return {
            data: null,
            error: {
                code: 'delete_error',
                message: 'Failed to delete project',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

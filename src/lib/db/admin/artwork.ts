import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type ArtworkInput = Database['public']['Tables']['artwork']['Insert'];
export type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

export interface ArtworkAdminError {
    code: string;
    message: string;
    details?: string;
}

export async function getAllArtworkAdmin(
    limit: number = 50,
    offset: number = 0
): Promise<{ data: ArtworkRow[] | null; error: ArtworkAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('artwork')
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
                message: 'Failed to fetch artwork',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function getArtworkById(
    id: string
): Promise<{ data: ArtworkRow | null; error: ArtworkAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('artwork')
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
                message: 'Failed to fetch artwork',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function createArtwork(
    artwork: ArtworkInput
): Promise<{ data: ArtworkRow | null; error: ArtworkAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('artwork')
            .insert(artwork)
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
                message: 'Failed to create artwork',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function updateArtwork(
    id: string,
    artwork: Partial<ArtworkInput>
): Promise<{ data: ArtworkRow | null; error: ArtworkAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('artwork')
            .update(artwork)
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
                message: 'Failed to update artwork',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function deleteArtwork(
    id: string
): Promise<{ data: { id: string } | null; error: ArtworkAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { error } = await supabase
            .from('artwork')
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
                message: 'Failed to delete artwork',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

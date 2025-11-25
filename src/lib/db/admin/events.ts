import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type EventInput = Database['public']['Tables']['events']['Insert'];
export type EventRow = Database['public']['Tables']['events']['Row'];

export interface EventAdminError {
    code: string;
    message: string;
    details?: string;
}

export async function getAllEventsAdmin(
    limit: number = 50,
    offset: number = 0
): Promise<{ data: EventRow[] | null; error: EventAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('events')
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
                message: 'Failed to fetch events',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function getEventById(
    id: string
): Promise<{ data: EventRow | null; error: EventAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('events')
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
                message: 'Failed to fetch event',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function createEvent(
    event: EventInput
): Promise<{ data: EventRow | null; error: EventAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('events')
            .insert(event)
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
                message: 'Failed to create event',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function updateEvent(
    id: string,
    event: Partial<EventInput>
): Promise<{ data: EventRow | null; error: EventAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
            .from('events')
            .update(event)
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
                message: 'Failed to update event',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

export async function deleteEvent(
    id: string
): Promise<{ data: { id: string } | null; error: EventAdminError | null }> {
    try {
        if (typeof window !== 'undefined') {
            throw new Error('Admin queries must run server-side only');
        }

        const supabase = await createServiceRoleClient();
        const { error } = await supabase
            .from('events')
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
                message: 'Failed to delete event',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Events database query functions
 *
 * Handles all queries related to events (conventions, appearances, etc.)
 */

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface EventQueryError {
    code: string;
    message: string;
}

/**
 * Get all published events ordered by start_date (upcoming first)
 *
 * @param limit Maximum number of items to return
 * @param offset Pagination offset
 * @returns Array of published events or error
 */
export async function getAllEvents(
    limit: number = 50,
    offset: number = 0
): Promise<{
    data: Database['public']['Tables']['events']['Row'][] | null;
    error: EventQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('is_published', true)
            .order('start_date', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code || 'unknown',
                    message: error.message,
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: errorMessage,
            },
        };
    }
}

/**
 * Get upcoming events (starting from today)
 *
 * @param limit Maximum number of items to return
 * @returns Array of upcoming events or error
 */
export async function getUpcomingEvents(limit: number = 10): Promise<{
    data: Database['public']['Tables']['events']['Row'][] | null;
    error: EventQueryError | null;
}> {
    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('is_published', true)
            .gte('end_date', today)
            .order('start_date', { ascending: true })
            .limit(limit);

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code || 'unknown',
                    message: error.message,
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: errorMessage,
            },
        };
    }
}

/**
 * Get event by slug
 *
 * @param slug The event slug
 * @returns Single event or error
 */
export async function getEventBySlug(slug: string): Promise<{
    data: Database['public']['Tables']['events']['Row'] | null;
    error: EventQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();

        if (error) {
            return {
                data: null,
                error: {
                    code: error.code || 'unknown',
                    message: error.message,
                },
            };
        }

        return { data, error: null };
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: errorMessage,
            },
        };
    }
}

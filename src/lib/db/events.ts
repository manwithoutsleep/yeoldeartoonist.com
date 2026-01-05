import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { Database } from '@/types/database';

/**
 * Events database query functions
 *
 * Handles all queries related to events (conventions, appearances, etc.)
 *
 * Caching Strategy:
 * - getAllEvents: 30 minutes cache (revalidate: 1800)
 * - getUpcomingEvents: 30 minutes cache (revalidate: 1800)
 * - getEventBySlug: 30 minutes cache (revalidate: 1800)
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
 * Internal function to get all published events
 */
async function getAllEventsInternal(
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
        console.error('getAllEvents query failed:', err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to load events. Please try again later.',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get all published events ordered by start_date (with caching)
 *
 * @param limit Maximum number of items to return
 * @param offset Pagination offset
 * @returns Array of published events or error
 */
export const getAllEvents = unstable_cache(
    getAllEventsInternal,
    ['events-all'],
    {
        revalidate: 1800, // 30 minutes
        tags: ['events'],
    }
);

/**
 * Internal function to get upcoming events
 */
async function getUpcomingEventsInternal(limit: number = 10): Promise<{
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
        console.error('getUpcomingEvents query failed:', err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message:
                    'Failed to load upcoming events. Please try again later.',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get upcoming events (starting from today) (with caching)
 *
 * @param limit Maximum number of items to return
 * @returns Array of upcoming events or error
 */
export const getUpcomingEvents = unstable_cache(
    getUpcomingEventsInternal,
    ['events-upcoming'],
    {
        revalidate: 1800, // 30 minutes
        tags: ['events'],
    }
);

/**
 * Internal function to get event by slug
 */
async function getEventBySlugInternal(slug: string): Promise<{
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
        console.error(`getEventBySlug query failed for slug "${slug}":`, err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to load event. Please try again later.',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get event by slug (with caching)
 *
 * @param slug The event slug
 * @returns Single event or error
 */
export const getEventBySlug = (slug: string) =>
    unstable_cache(
        () => getEventBySlugInternal(slug),
        ['event-by-slug', slug],
        {
            revalidate: 1800, // 30 minutes
            tags: ['events', `event-${slug}`],
        }
    )();

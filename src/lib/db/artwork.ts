import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Artwork database query functions
 *
 * Handles all queries related to artwork (gallery items and shop products)
 */

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ArtworkQueryError {
    code: string;
    message: string;
}

/**
 * Get all published artwork ordered by display_order
 *
 * @returns Array of published artwork or error
 */
export async function getAllArtwork(
    limit: number = 50,
    offset: number = 0
): Promise<{
    data: Database['public']['Tables']['artwork']['Row'][] | null;
    error: ArtworkQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('artwork')
            .select('*')
            .eq('is_published', true)
            .order('display_order', { ascending: true })
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
        console.error('getAllArtwork query failed:', err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to load artwork. Please try again later.',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get featured artwork for homepage
 *
 * @param limit Maximum number of items to return
 * @returns Array of featured artwork or error
 */
export async function getFeaturedArtwork(limit: number = 6): Promise<{
    data: Database['public']['Tables']['artwork']['Row'][] | null;
    error: ArtworkQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('artwork')
            .select('*')
            .eq('is_published', true)
            .eq('is_featured', true)
            .order('display_order', { ascending: true })
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
        console.error('getFeaturedArtwork query failed:', err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message:
                    'Failed to load featured artwork. Please try again later.',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get artwork by slug
 *
 * @param slug The artwork slug
 * @returns Single artwork item or error
 */
export async function getArtworkBySlug(slug: string): Promise<{
    data: Database['public']['Tables']['artwork']['Row'] | null;
    error: ArtworkQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('artwork')
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
        console.error(`getArtworkBySlug query failed for slug "${slug}":`, err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to load artwork. Please try again later.',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get all artwork slugs for static generation
 *
 * @returns Array of slugs or error
 */
export async function getAllArtworkSlugs(): Promise<{
    data: Array<{ slug: string }> | null;
    error: ArtworkQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('artwork')
            .select('slug')
            .eq('is_published', true)
            .order('display_order', { ascending: true });

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
        console.error('getAllArtworkSlugs query failed:', err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message:
                    'Failed to load artwork slugs. Please try again later.',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

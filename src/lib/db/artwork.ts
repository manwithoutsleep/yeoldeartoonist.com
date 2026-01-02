import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { Database } from '@/types/database';

/**
 * Artwork database query functions
 *
 * Handles all queries related to artwork (gallery items and shop products)
 *
 * Caching Strategy:
 * - getAllArtwork: 1 hour cache (revalidate: 3600)
 * - getFeaturedArtwork: 1 hour cache (revalidate: 3600)
 * - getArtworkBySlug: 1 hour cache (revalidate: 3600)
 * - getAllArtworkSlugs: 1 hour cache (revalidate: 3600)
 *
 * Cache tags allow for on-demand revalidation via /api/admin/revalidate
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
 * Internal function to get all published artwork ordered by display_order
 */
async function getAllArtworkInternal(
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
 * Get all published artwork ordered by display_order (with caching)
 *
 * @returns Array of published artwork or error
 */
export const getAllArtwork = unstable_cache(
    getAllArtworkInternal,
    ['artwork-all'],
    {
        revalidate: 3600, // 1 hour
        tags: ['artwork'],
    }
);

/**
 * Internal function to get featured artwork for homepage
 */
async function getFeaturedArtworkInternal(limit: number = 6): Promise<{
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
 * Get featured artwork for homepage (with caching)
 *
 * @param limit Maximum number of items to return
 * @returns Array of featured artwork or error
 */
export const getFeaturedArtwork = unstable_cache(
    getFeaturedArtworkInternal,
    ['artwork-featured'],
    {
        revalidate: 3600, // 1 hour
        tags: ['artwork'],
    }
);

/**
 * Internal function to get artwork by slug
 */
async function getArtworkBySlugInternal(slug: string): Promise<{
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
 * Get artwork by slug (with caching)
 *
 * @param slug The artwork slug
 * @returns Single artwork item or error
 */
export const getArtworkBySlug = (slug: string) =>
    unstable_cache(
        () => getArtworkBySlugInternal(slug),
        ['artwork-by-slug', slug],
        {
            revalidate: 3600, // 1 hour
            tags: ['artwork', `artwork-${slug}`],
        }
    )();

/**
 * Internal function to get all artwork slugs for static generation
 */
async function getAllArtworkSlugsInternal(): Promise<{
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

/**
 * Get all artwork slugs for static generation (with caching)
 *
 * @returns Array of slugs or error
 */
export const getAllArtworkSlugs = unstable_cache(
    getAllArtworkSlugsInternal,
    ['artwork-slugs'],
    {
        revalidate: 3600, // 1 hour
        tags: ['artwork'],
    }
);

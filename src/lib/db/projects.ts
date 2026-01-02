import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { Database } from '@/types/database';

/**
 * Projects database query functions
 *
 * Handles all queries related to projects (works in progress)
 *
 * Caching Strategy:
 * - getAllProjects: 1 hour cache (revalidate: 3600)
 * - getProjectBySlug: 1 hour cache (revalidate: 3600)
 */

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ProjectQueryError {
    code: string;
    message: string;
}

/**
 * Internal function to get all published projects
 */
async function getAllProjectsInternal(
    limit: number = 50,
    offset: number = 0
): Promise<{
    data: Database['public']['Tables']['projects']['Row'][] | null;
    error: ProjectQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('projects')
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
        console.error('getAllProjects query failed:', err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to load projects. Please try again later.',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get all published projects ordered by display_order (with caching)
 *
 * @param limit Maximum number of items to return
 * @param offset Pagination offset
 * @returns Array of published projects or error
 */
export const getAllProjects = unstable_cache(
    getAllProjectsInternal,
    ['projects-all'],
    {
        revalidate: 3600, // 1 hour
        tags: ['projects'],
    }
);

/**
 * Internal function to get project by slug
 */
async function getProjectBySlugInternal(slug: string): Promise<{
    data: Database['public']['Tables']['projects']['Row'] | null;
    error: ProjectQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('projects')
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
        console.error(`getProjectBySlug query failed for slug "${slug}":`, err);
        return {
            data: null,
            error: {
                code: 'fetch_error',
                message: 'Failed to load project. Please try again later.',
                ...(process.env.NODE_ENV === 'development' && {
                    details:
                        err instanceof Error ? err.message : 'Unknown error',
                }),
            },
        };
    }
}

/**
 * Get project by slug (with caching)
 *
 * @param slug The project slug
 * @returns Single project or error
 */
export const getProjectBySlug = (slug: string) =>
    unstable_cache(
        () => getProjectBySlugInternal(slug),
        ['project-by-slug', slug],
        {
            revalidate: 3600, // 1 hour
            tags: ['projects', `project-${slug}`],
        }
    )();

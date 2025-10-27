import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Projects database query functions
 *
 * Handles all queries related to projects (works in progress)
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
 * Get all published projects ordered by display_order
 *
 * @param limit Maximum number of items to return
 * @param offset Pagination offset
 * @returns Array of published projects or error
 */
export async function getAllProjects(
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
 * Get project by slug
 *
 * @param slug The project slug
 * @returns Single project or error
 */
export async function getProjectBySlug(slug: string): Promise<{
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

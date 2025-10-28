import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Pages database query functions
 *
 * Handles all queries related to CMS pages (about, etc.)
 */

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PageQueryError {
    code: string;
    message: string;
}

/**
 * Get all published pages ordered by display_order
 *
 * @returns Array of published pages or error
 */
export async function getAllPages(): Promise<{
    data: Database['public']['Tables']['pages']['Row'][] | null;
    error: PageQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('pages')
            .select('*')
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
 * Get page by slug
 *
 * @param slug The page slug
 * @returns Single page or error
 */
export async function getPageBySlug(slug: string): Promise<{
    data: Database['public']['Tables']['pages']['Row'] | null;
    error: PageQueryError | null;
}> {
    try {
        const { data, error } = await supabase
            .from('pages')
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

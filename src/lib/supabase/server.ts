/**
 * Supabase Server Client
 *
 * This client is used for server-side operations where you have access to
 * environment variables and can safely use the service role key for
 * admin operations.
 *
 * Use this in:
 * - API routes
 * - Server components
 * - Middleware
 *
 * Prefer using the anon key (createServiceRoleClient) for most operations,
 * only use the service role key when absolutely necessary for admin functions.
 */

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Create a Supabase client for use in Server Components.
 * Uses the service role key for full database access, bypassing RLS.
 */
export const createServiceRoleClient = async () => {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
};

/**
 * Create a Supabase client for use in Server Components with user session.
 * Uses the anon key and reads from request cookies to get the user session.
 */
export const createAnonClient = async () => {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
};

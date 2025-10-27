/**
 * Supabase Browser Client
 *
 * This client is used for client-side operations where you have access to
 * browser storage. It uses the public anon key for reading published data
 * and will trigger auth flows for admin operations.
 *
 * Never use this for sensitive operations - use the server client instead.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

/**
 * Create a Supabase client for use in the browser.
 * Uses the public anon key and manages authentication via browser storage.
 * Suitable for client-side operations on public data and user auth flows.
 *
 * @returns {SupabaseClient} A configured Supabase client instance
 */
export const createClient = () =>
    createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

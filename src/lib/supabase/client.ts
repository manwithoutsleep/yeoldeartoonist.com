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

export const createClient = () =>
    createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

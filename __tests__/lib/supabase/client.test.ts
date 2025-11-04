import { createClient } from '@/lib/supabase/client';

/**
 * Tests for Supabase browser client factory
 *
 * These tests verify that the Supabase client is correctly instantiated
 * with the proper environment variables and configuration.
 */
describe('Supabase Client', () => {
    it('should create a Supabase client instance', () => {
        const client = createClient();
        expect(client).toBeDefined();
        expect(client).toHaveProperty('auth');
        expect(client).toHaveProperty('from');
    });

    it('should throw error if SUPABASE_URL is missing', async () => {
        const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        delete process.env.NEXT_PUBLIC_SUPABASE_URL;

        // Clear the module cache to force re-require
        jest.resetModules();

        await expect(import('@/lib/supabase/client')).rejects.toThrow(
            'Missing Supabase environment variables'
        );

        // Restore original value
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    });

    it('should throw error if SUPABASE_ANON_KEY is missing', async () => {
        const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        jest.resetModules();

        await expect(import('@/lib/supabase/client')).rejects.toThrow(
            'Missing Supabase environment variables'
        );

        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    });
});

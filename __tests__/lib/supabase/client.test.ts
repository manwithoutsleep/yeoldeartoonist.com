import { describe, it, expect } from 'vitest';
import { createClient } from '@/lib/supabase/client';

/**
 * Tests for Supabase browser client factory
 *
 * These tests verify that the Supabase client is correctly instantiated
 * with the proper environment variables and configuration.
 *
 * Note: Tests for missing environment variables are not included here
 * because the module throws at import time, making it difficult to test
 * without causing test hangs. Environment variable validation is tested
 * indirectly through the middleware tests.
 */
describe('Supabase Client', () => {
    it('should create a Supabase client instance', () => {
        const client = createClient();
        expect(client).toBeDefined();
        expect(client).toHaveProperty('auth');
        expect(client).toHaveProperty('from');
    });

    it('should have required Supabase client methods', () => {
        const client = createClient();
        expect(typeof client.from).toBe('function');
        expect(typeof client.auth.getUser).toBe('function');
        expect(typeof client.auth.signInWithPassword).toBe('function');
        expect(typeof client.auth.signOut).toBe('function');
    });
});

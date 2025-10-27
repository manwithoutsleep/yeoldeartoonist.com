import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Normalized error type that always has a message property
 * for consistent error handling across all auth operations
 */
interface AuthError {
    message: string;
}

function normalizeError(error: unknown): AuthError {
    if (error instanceof Error) {
        return { message: error.message };
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return { message: String((error as Record<string, unknown>).message) };
    }
    return { message: 'An unexpected error occurred' };
}

/**
 * Custom hook for authentication operations with consistent error handling.
 * Manages sign in, sign up, and sign out flows with Supabase Auth.
 * All errors are normalized to an AuthError type with a consistent message property.
 *
 * @returns {Object} Authentication methods and state
 * @returns {Function} signIn - Sign in with email and password
 * @returns {Function} signUp - Create a new user account
 * @returns {Function} signOut - Sign out the current user
 * @returns {boolean} loading - Loading state during auth operations
 * @returns {AuthError | null} error - Error state from normalized errors
 *
 * @example
 * const { signIn, loading, error } = useAuth();
 * const { data, error: signInError } = await signIn(email, password);
 * if (signInError) {
 *   console.error(signInError.message); // Always has message property
 * }
 */
export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);

    const signIn = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { data, error: signInError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (signInError) {
                const normalizedError = normalizeError(signInError);
                setError(normalizedError);
                return { data: null, error: normalizedError };
            }

            return { data, error: null };
        } catch (err) {
            const normalizedError = normalizeError(err);
            setError(normalizedError);
            return { data: null, error: normalizedError };
        } finally {
            setLoading(false);
        }
    }, []);
    // Note: Empty dependency array is correct. setLoading and setError are stable setState functions.
    // createClient and normalizeError are pure functions without dependencies.
    // This callback doesn't need parameters from the component scope.

    const signUp = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                const normalizedError = normalizeError(signUpError);
                setError(normalizedError);
                return { data: null, error: normalizedError };
            }

            return { data, error: null };
        } catch (err) {
            const normalizedError = normalizeError(err);
            setError(normalizedError);
            return { data: null, error: normalizedError };
        } finally {
            setLoading(false);
        }
    }, []);
    // Note: Same as signIn - empty dependency array is correct for the same reasons.

    const signOut = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error: signOutError } = await supabase.auth.signOut();

            if (signOutError) {
                const normalizedError = normalizeError(signOutError);
                setError(normalizedError);
                return { error: normalizedError };
            }

            return { error: null };
        } catch (err) {
            const normalizedError = normalizeError(err);
            setError(normalizedError);
            return { error: normalizedError };
        } finally {
            setLoading(false);
        }
    }, []);
    // Note: Same as signIn and signUp - empty dependency array is correct.

    return {
        signIn,
        signUp,
        signOut,
        loading,
        error,
    };
}

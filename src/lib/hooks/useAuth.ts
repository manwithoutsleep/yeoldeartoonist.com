import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                setError(signInError.message);
                return { data: null, error: signInError };
            }

            return { data, error: null };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'An error occurred';
            setError(message);
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

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
                setError(signUpError.message);
                return { data: null, error: signUpError };
            }

            return { data, error: null };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'An error occurred';
            setError(message);
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error: signOutError } = await supabase.auth.signOut();

            if (signOutError) {
                setError(signOutError.message);
                return { error: signOutError };
            }

            return { error: null };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'An error occurred';
            setError(message);
            return { error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        signIn,
        signUp,
        signOut,
        loading,
        error,
    };
}

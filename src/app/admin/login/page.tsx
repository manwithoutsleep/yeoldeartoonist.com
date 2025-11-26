'use client';

import { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * Sanitize authentication error messages to prevent account enumeration attacks.
 * Reveals only generic errors instead of specific user/password errors.
 */
function sanitizeAuthError(errorMessage: string): string {
    if (!errorMessage) {
        return 'An error occurred. Please try again.';
    }

    const lowerMessage = errorMessage.toLowerCase();

    // Prevent revealing whether an email exists in the system
    if (
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('no user') ||
        lowerMessage.includes('not found')
    ) {
        return 'Invalid email or password';
    }

    // Network/service errors
    if (
        lowerMessage.includes('network') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('service unavailable')
    ) {
        return 'Authentication service temporarily unavailable. Please try again.';
    }

    // Generic fallback for unexpected errors
    return 'An error occurred. Please try again.';
}

export default function LoginPage() {
    const router = useRouter();
    const { signIn, loading, error: authError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Force light mode for admin login page regardless of system preference
    // useLayoutEffect runs synchronously before browser paint, preventing flash
    useLayoutEffect(() => {
        // Add light-mode class to html element to override dark mode
        document.documentElement.classList.add('light-mode');

        // Cleanup: remove light-mode class when leaving login page
        return () => {
            document.documentElement.classList.remove('light-mode');
        };
    }, []);

    // Check if user is already authenticated on component mount
    // Prevents redirect race condition with cleanup flag
    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            // Check middleware cache first - if admin_session cookie exists and is valid, user is authenticated
            const cookies = document.cookie;
            if (cookies.includes('admin_session')) {
                const adminSessionCookie = cookies
                    .split('; ')
                    .find((row) => row.startsWith('admin_session='));

                if (adminSessionCookie) {
                    try {
                        const sessionValue = decodeURIComponent(
                            adminSessionCookie.split('=')[1]
                        );
                        const sessionData = JSON.parse(sessionValue);

                        // Verify session hasn't expired
                        if (sessionData?.expiresAt > Date.now() && isMounted) {
                            // User is already logged in, redirect to admin dashboard
                            router.push('/admin');
                            return;
                        }
                    } catch {
                        // Cookie parsing failed, continue with normal flow
                        if (process.env.NODE_ENV === 'development') {
                            console.debug('Session cookie parsing failed');
                        }
                    }
                }
            }

            if (isMounted) {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            if (!email || !password) {
                setError('Email and password are required');
                return;
            }

            console.log('[DEBUG] Starting sign-in...');
            const { data, error: signInError } = await signIn(email, password);
            console.log('[DEBUG] Sign-in result:', {
                hasData: !!data,
                hasSession: !!data?.session,
                hasError: !!signInError,
            });

            if (signInError) {
                console.error('[DEBUG] Sign-in error:', signInError);
                // Sanitize error message to prevent account enumeration
                const sanitized = sanitizeAuthError(signInError.message);
                setError(sanitized);
                return;
            }

            if (data?.session) {
                console.log('[DEBUG] Session created, redirecting to /admin');
                // Use window.location.href for full page reload to ensure server-side layout re-renders
                // This is necessary because the admin layout reads session from cookies on the server
                window.location.href = '/admin';
            } else {
                console.error('[DEBUG] No session in response data');
                setError('Authentication succeeded but no session was created');
            }
        },
        [email, password, signIn]
    );
    // Dependencies are necessary: email and password are form state that changes,
    // signIn is a stable callback from useAuth.
    // This callback must update whenever these values change to ensure fresh values in the handler.

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
                    </div>
                    <p className="text-gray-600 font-medium">
                        Checking authentication...
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Redirecting if you are already logged in...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Admin Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your credentials to access the admin panel
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {(error || authError) && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm font-medium text-red-800">
                                {error ||
                                    (authError?.message
                                        ? sanitizeAuthError(authError.message)
                                        : 'An error occurred. Please try again.')}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-600">
                    <p>Admin accounts are created by super_admin users only.</p>
                </div>
            </div>
        </div>
    );
}

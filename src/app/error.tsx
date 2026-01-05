'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Global Error Boundary for Next.js App Router
 *
 * This component catches errors in page components and nested components.
 * It provides a user-friendly fallback UI and logs errors in development.
 *
 * Key features:
 * - Catches client-side rendering errors
 * - Displays friendly error message to users
 * - Logs detailed error information in development
 * - Provides "Try again" button to reset error state
 * - Maintains site branding and navigation
 *
 * Note: This does NOT catch errors in the root layout.
 * For those, see global-error.tsx
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error details in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error boundary caught:', error);
            console.error('Error stack:', error.stack);
            if (error.digest) {
                console.error('Error digest:', error.digest);
            }
        } else {
            // In production, log minimal info (digest is useful for Vercel logs)
            console.error('Application error:', error.message);
            if (error.digest) {
                console.error('Error digest:', error.digest);
            }
        }
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-2xl w-full text-center">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">
                        Oops!
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                        Something went wrong
                    </p>
                    <p className="text-gray-500">
                        We encountered an unexpected error. Don&apos;t worry,
                        we&apos;ve logged the issue and will look into it.
                    </p>
                </div>

                {/* Show error message in development only */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                        <h2 className="text-sm font-semibold text-red-800 mb-2">
                            Development Error Details:
                        </h2>
                        <p className="text-sm text-red-700 font-mono break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-red-600 mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                        Go Home
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">
                        Need help? Here are some quick links:
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center text-sm">
                        <Link
                            href="/gallery"
                            className="text-gray-700 hover:text-black underline"
                        >
                            Gallery
                        </Link>
                        <Link
                            href="/shoppe"
                            className="text-gray-700 hover:text-black underline"
                        >
                            Shoppe
                        </Link>
                        <Link
                            href="/about"
                            className="text-gray-700 hover:text-black underline"
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="text-gray-700 hover:text-black underline"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

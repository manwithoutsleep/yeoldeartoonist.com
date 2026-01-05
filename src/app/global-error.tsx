'use client';

import { useEffect } from 'react';

/**
 * Root Error Boundary for Next.js App Router
 *
 * This component catches errors in the root layout and other errors
 * that aren't caught by the regular error.tsx boundary.
 *
 * IMPORTANT: This is a last-resort fallback for catastrophic failures.
 * When this component renders, the root layout may be broken, so we
 * cannot rely on any layout components, fonts, or styles from the app.
 *
 * This component must:
 * - Include its own <html> and <body> tags
 * - Use inline styles (external CSS may not load)
 * - Be as minimal as possible
 * - Always render successfully
 *
 * Note: In development, Next.js may show its error overlay instead.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error details
        if (process.env.NODE_ENV === 'development') {
            console.error('Global error boundary caught:', error);
            console.error('Error stack:', error.stack);
            if (error.digest) {
                console.error('Error digest:', error.digest);
            }
        } else {
            // In production, log minimal info
            console.error('Critical application error:', error.message);
            if (error.digest) {
                console.error('Error digest:', error.digest);
            }
        }
    }, [error]);

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>Error - Ye Olde Artoonist</title>
                <style>{`
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
                        background: linear-gradient(to bottom, #ffffff, #f9fafb);
                        color: #111827;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 1rem;
                    }
                    .container {
                        max-width: 42rem;
                        width: 100%;
                        text-align: center;
                    }
                    h1 {
                        font-size: 3.75rem;
                        font-weight: 700;
                        margin-bottom: 1rem;
                        color: #111827;
                    }
                    .subtitle {
                        font-size: 1.25rem;
                        color: #4b5563;
                        margin-bottom: 0.5rem;
                    }
                    .description {
                        color: #6b7280;
                        margin-bottom: 2rem;
                    }
                    .error-details {
                        background: #fef2f2;
                        border: 1px solid #fecaca;
                        border-radius: 0.5rem;
                        padding: 1rem;
                        margin-bottom: 2rem;
                        text-align: left;
                    }
                    .error-details h2 {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #991b1b;
                        margin-bottom: 0.5rem;
                    }
                    .error-details p {
                        font-size: 0.875rem;
                        color: #b91c1c;
                        font-family: 'Courier New', monospace;
                        word-break: break-all;
                    }
                    .error-digest {
                        font-size: 0.75rem;
                        color: #dc2626;
                        margin-top: 0.5rem;
                    }
                    .button-group {
                        display: flex;
                        gap: 1rem;
                        justify-content: center;
                        flex-wrap: wrap;
                    }
                    button, a {
                        padding: 0.75rem 1.5rem;
                        font-size: 1rem;
                        font-weight: 600;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                        transition: all 0.2s;
                    }
                    button {
                        background: #000000;
                        color: #ffffff;
                        border: none;
                    }
                    button:hover {
                        background: #1f2937;
                    }
                    a {
                        background: #ffffff;
                        color: #000000;
                        border: 2px solid #000000;
                    }
                    a:hover {
                        background: #000000;
                        color: #ffffff;
                    }
                    button:focus, a:focus {
                        outline: 2px solid #000000;
                        outline-offset: 2px;
                    }
                `}</style>
            </head>
            <body>
                <div className="container">
                    <h1>Critical Error</h1>
                    <p className="subtitle">We encountered a critical error</p>
                    <p className="description">
                        Something went seriously wrong. We&apos;ve logged the
                        issue and will investigate. Please try again or return
                        to the homepage.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="error-details">
                            <h2>Development Error Details:</h2>
                            <p>{error.message}</p>
                            {error.digest && (
                                <p className="error-digest">
                                    Digest: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="button-group">
                        <button onClick={reset}>Try Again</button>
                        <button
                            onClick={() => (window.location.href = '/')}
                            style={{
                                background: '#ffffff',
                                color: '#000000',
                                border: '2px solid #000000',
                            }}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}

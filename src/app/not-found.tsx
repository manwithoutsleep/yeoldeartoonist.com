import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for could not be found.',
};

/**
 * Custom 404 Not Found Page
 *
 * This component is displayed when a user navigates to a route that doesn't exist.
 * It provides a user-friendly message and helpful navigation links.
 *
 * Features:
 * - Clear messaging about the missing page
 * - Quick navigation to main sections of the site
 * - Maintains site header and footer (via layout)
 * - SEO-friendly with proper metadata
 */
export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-2xl w-full text-center">
                <div className="mb-8">
                    <h1 className="text-8xl font-bold text-gray-900 mb-4">
                        404
                    </h1>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-gray-600">
                        The page you&apos;re looking for doesn&apos;t exist or
                        may have been moved.
                    </p>
                </div>

                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                        Return Home
                    </Link>
                </div>

                <div className="pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">
                        Or explore these sections:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            href="/gallery"
                            className="p-4 border border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all group"
                        >
                            <div className="text-2xl mb-2">🎨</div>
                            <div className="font-semibold text-gray-900 group-hover:text-black">
                                Gallery
                            </div>
                            <div className="text-sm text-gray-500">
                                View artwork
                            </div>
                        </Link>

                        <Link
                            href="/shoppe"
                            className="p-4 border border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all group"
                        >
                            <div className="text-2xl mb-2">🛍️</div>
                            <div className="font-semibold text-gray-900 group-hover:text-black">
                                Shoppe
                            </div>
                            <div className="text-sm text-gray-500">
                                Shop prints
                            </div>
                        </Link>

                        <Link
                            href="/about"
                            className="p-4 border border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all group"
                        >
                            <div className="text-2xl mb-2">👤</div>
                            <div className="font-semibold text-gray-900 group-hover:text-black">
                                About
                            </div>
                            <div className="text-sm text-gray-500">
                                Meet the artist
                            </div>
                        </Link>

                        <Link
                            href="/contact"
                            className="p-4 border border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all group"
                        >
                            <div className="text-2xl mb-2">✉️</div>
                            <div className="font-semibold text-gray-900 group-hover:text-black">
                                Contact
                            </div>
                            <div className="text-sm text-gray-500">
                                Get in touch
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

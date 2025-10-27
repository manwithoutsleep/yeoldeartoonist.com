import Link from 'next/link';

/**
 * Footer component - displays contact info, copyright, and social links
 *
 * Features:
 * - White background with black text
 * - Contact information
 * - Social media links
 * - Copyright notice
 * - Responsive design
 */
export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white border-t border-black mt-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-bold text-black mb-4">
                            Contact
                        </h3>
                        <div className="text-black text-sm space-y-2">
                            <p>
                                <a
                                    href="mailto:contact@yeoldeartoonist.com"
                                    className="hover:underline"
                                >
                                    contact@yeoldeartoonist.com
                                </a>
                            </p>
                            <p>PO Box 123</p>
                            <p>Columbia, MO 65201</p>
                            <p>United States</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-black mb-4">
                            Quick Links
                        </h3>
                        <nav className="text-black text-sm space-y-2">
                            <Link href="/" className="block hover:underline">
                                Home
                            </Link>
                            <Link
                                href="/gallery"
                                className="block hover:underline"
                            >
                                Gallery
                            </Link>
                            <Link
                                href="/shoppe"
                                className="block hover:underline"
                            >
                                Shoppe
                            </Link>
                            <Link
                                href="/in-the-works"
                                className="block hover:underline"
                            >
                                In The Works
                            </Link>
                            <Link
                                href="/contact"
                                className="block hover:underline"
                            >
                                Contact
                            </Link>
                        </nav>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-lg font-bold text-black mb-4">
                            Follow Us
                        </h3>
                        <div className="text-black text-sm space-y-2">
                            <a
                                href="#"
                                className="block hover:underline"
                                aria-label="Twitter"
                            >
                                Twitter
                            </a>
                            <a
                                href="#"
                                className="block hover:underline"
                                aria-label="Instagram"
                            >
                                Instagram
                            </a>
                            <a
                                href="#"
                                className="block hover:underline"
                                aria-label="Facebook"
                            >
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-300 mt-8 pt-8 text-center text-black text-sm">
                    <p>
                        &copy; {currentYear} Ye Olde Artoonist. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

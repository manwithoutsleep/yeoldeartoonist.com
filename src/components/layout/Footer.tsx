import { siteConfig } from '@/config/site';
import Link from 'next/link';
import { SocialMediaIcon } from '@/components/ui/SocialMediaIcon';

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
        <footer
            className="w-full bg-white border-t border-black mt-3"
            role="contentinfo"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-lg font-bold text-black mb-4">
                            Contact
                        </h2>
                        <div className="text-black text-sm space-y-2">
                            <p>
                                <a
                                    href={`mailto:${siteConfig.artist.email}`}
                                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-black rounded"
                                    aria-label={`Email ${siteConfig.artist.name}`}
                                >
                                    {siteConfig.artist.email}
                                </a>
                            </p>
                            <p>{siteConfig.artist.mailingAddress.poBox}</p>
                            <p>
                                {siteConfig.artist.mailingAddress.city},{' '}
                                {siteConfig.artist.mailingAddress.state}{' '}
                                {siteConfig.artist.mailingAddress.zip}
                            </p>
                            <p>{siteConfig.artist.mailingAddress.country}</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h2 className="text-lg font-bold text-black mb-4">
                            Quick Links
                        </h2>
                        <nav
                            className="text-black text-sm space-y-2"
                            aria-label="Footer navigation"
                        >
                            <Link
                                href="/"
                                className="block hover:underline focus:outline-none focus:ring-2 focus:ring-black rounded"
                            >
                                Home
                            </Link>
                            {siteConfig.navigation.cards.map((card) => (
                                <Link
                                    key={card.href}
                                    href={card.href}
                                    className="block hover:underline focus:outline-none focus:ring-2 focus:ring-black rounded"
                                >
                                    {card.title}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h2 className="text-lg font-bold text-black mb-4">
                            Follow Us
                        </h2>
                        <div className="space-y-2">
                            {siteConfig.socialMedia.sites.map((site) => (
                                <SocialMediaIcon
                                    key={site.href}
                                    title={site.title}
                                    handle={site.handle}
                                    href={site.href}
                                    variant="dark"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-300 mt-8 pt-8 text-center text-black text-sm">
                    <p>
                        &copy; {currentYear} {siteConfig.artist.name}. All
                        rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

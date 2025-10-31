'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

/**
 * Navigation component - responsive navigation with image buttons for desktop
 *
 * Features:
 * - Desktop: Image-based navigation buttons (nav-*.jpg files)
 * - Mobile: Text-based navigation (switches for better UX)
 * - White background with black text
 * - Responsive design
 */
export function Navigation() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { label: 'Gallery', href: '/gallery', image: 'nav-gallery.webp' },
        { label: 'Shoppe', href: '/shoppe', image: 'nav-shoppe.webp' },
        {
            label: 'In The Works',
            href: '/in-the-works',
            image: 'nav-in-the-works.webp',
        },
        { label: 'Contact', href: '/contact', image: 'nav-contact.webp' },
    ];

    return (
        <nav className="w-full bg-white border-b-2 border-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Desktop Navigation - Image buttons */}
                <div className="hidden md:flex justify-center gap-4 py-4 min-h-[120px] items-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative overflow-hidden rounded transition-transform hover:scale-105 w-[250px] aspect-[250/100]"
                        >
                            <Image
                                src={`/images/navigation/${item.image}`}
                                alt={item.label}
                                fill
                                sizes="250px"
                                className="object-contain"
                                loading="lazy"
                            />
                        </Link>
                    ))}
                </div>

                {/* Mobile Navigation Toggle */}
                <div className="md:hidden flex items-center justify-between py-4 min-h-[50px]">
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="text-black text-2xl font-bold"
                        aria-label="Toggle navigation"
                    >
                        ☰
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block px-4 py-2 text-black hover:bg-gray-100 rounded transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}

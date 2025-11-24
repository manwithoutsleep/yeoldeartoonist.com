'use client';

/**
 * AdminNavigation Component
 *
 * Responsive navigation for admin dashboard:
 * - Desktop (≥1024px): Horizontal menu bar
 * - Mobile/Tablet (<1024px): Collapsible sidebar
 *
 * Features:
 * - Active route highlighting
 * - Role-based visibility (Settings for super_admin only)
 * - Responsive design with Tailwind
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface AdminNavigationProps {
    /**
     * Current admin role (determines visibility of Settings link)
     */
    role: 'admin' | 'super_admin';

    /**
     * Whether sidebar is open on mobile
     */
    isOpen: boolean;

    /**
     * Callback when sidebar should close (backdrop click, etc.)
     */
    onClose: () => void;
}

const navigationLinks = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Artwork', href: '/admin/artwork' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Projects', href: '/admin/projects' },
    { label: 'Events', href: '/admin/events' },
    {
        label: 'Settings',
        href: '/admin/settings',
        requiresSuperAdmin: true,
    },
];

export function AdminNavigation({
    role,
    isOpen,
    onClose,
}: AdminNavigationProps) {
    const pathname = usePathname();

    // Filter links based on role
    const visibleLinks = navigationLinks.filter((link) => {
        if (link.requiresSuperAdmin && role !== 'super_admin') {
            return false;
        }
        return true;
    });

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop Menu Bar (≥1024px) */}
            <nav className="hidden lg:flex h-12 bg-white border-b-2 border-black items-center gap-1 px-6">
                {visibleLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`px-4 py-2 transition-colors ${
                            isActive(link.href)
                                ? 'admin-nav-active'
                                : 'admin-nav-inactive'
                        }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Mobile/Tablet Sidebar (<1024px) */}
            <>
                {/* Backdrop Overlay */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={onClose}
                        role="presentation"
                    ></div>
                )}

                {/* Sidebar */}
                <nav
                    className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r-2 border-black z-50 lg:hidden flex flex-col transition-transform transform ${
                        isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-1 p-4">
                            {visibleLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className={`block w-full text-left px-4 py-3 rounded transition-colors ${
                                        isActive(link.href)
                                            ? 'bg-black text-white font-semibold'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="border-t border-black p-4">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-gray-100 border border-black rounded hover:bg-gray-200 transition-colors"
                            aria-label="Close navigation"
                        >
                            Close
                        </button>
                    </div>
                </nav>
            </>
        </>
    );
}

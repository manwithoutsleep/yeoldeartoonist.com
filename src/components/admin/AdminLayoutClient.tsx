'use client';

/**
 * Admin Layout Client Component
 *
 * Client-side wrapper for admin layout that manages mobile menu state.
 * This allows the parent layout to be a server component while still
 * providing interactive features like the mobile menu toggle.
 */

import React, { useState, useLayoutEffect } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminNavigation } from './AdminNavigation';

interface AdminLayoutClientProps {
    adminName: string;
    role: 'admin' | 'super_admin';
    children: React.ReactNode;
}

export function AdminLayoutClient({
    adminName,
    role,
    children,
}: AdminLayoutClientProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Force light mode for admin pages regardless of system preference
    // useLayoutEffect runs synchronously before browser paint, preventing flash
    useLayoutEffect(() => {
        // Add light-mode class to html element to override dark mode
        document.documentElement.classList.add('light-mode');

        // Cleanup: remove light-mode class when leaving admin pages
        return () => {
            document.documentElement.classList.remove('light-mode');
        };
    }, []);

    return (
        <div className="admin-layout flex flex-col min-h-screen bg-gray-50">
            {/* Admin Header */}
            <AdminHeader
                adminName={adminName}
                onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            />

            {/* Admin Navigation */}
            <AdminNavigation
                role={role}
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6 max-w-7xl mx-auto w-full">{children}</div>
            </main>
        </div>
    );
}

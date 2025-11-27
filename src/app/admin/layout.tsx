/**
 * Admin Layout (Server Component)
 *
 * Layout wrapper for all admin pages (/admin/*).
 * Includes:
 * - AdminHeader with logo, user name, and logout
 * - AdminNavigation with responsive menu/sidebar
 * - Main content area for page children
 *
 * Features:
 * - Reads admin session from cookie server-side
 * - Mobile-responsive with hamburger menu
 * - Role-based navigation visibility
 * - /admin/login is handled separately and doesn't use this layout
 */

import React from 'react';
import { cookies, headers } from 'next/headers';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

interface AdminSession {
    userId: string;
    adminId: string;
    name: string;
    role: 'admin' | 'super_admin';
    expiresAt: number;
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if this is the login page - if so, just render children without layout
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';

    if (pathname === '/admin/login') {
        // Login page has its own layout, just return children
        return <>{children}</>;
    }

    // Read session from cookie server-side
    // The middleware ensures this cookie exists for all /admin routes except /admin/login
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    // If no session cookie, show a message (middleware should have redirected, but just in case)
    if (!sessionCookie) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">
                        Session not found
                    </p>
                    <p className="text-gray-700 mt-2">
                        Please{' '}
                        <a
                            href="/admin/login"
                            className="text-blue-600 underline"
                        >
                            log in
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    let adminSession: AdminSession;
    try {
        adminSession = JSON.parse(sessionCookie.value);

        // Check if session has required fields
        if (!adminSession.userId || !adminSession.name || !adminSession.role) {
            throw new Error('Invalid session data');
        }
    } catch (error) {
        console.error('Failed to parse admin session:', error);
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">
                        Invalid session
                    </p>
                    <p className="text-gray-700 mt-2">
                        Please{' '}
                        <a
                            href="/admin/login"
                            className="text-blue-600 underline"
                        >
                            log in again
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AdminLayoutClient
            adminName={adminSession.name}
            role={adminSession.role}
        >
            {children}
        </AdminLayoutClient>
    );
}

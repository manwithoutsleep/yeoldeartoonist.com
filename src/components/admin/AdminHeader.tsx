'use client';

/**
 * AdminHeader Component
 *
 * Compact header for admin dashboard with:
 * - Small logo (links to /admin dashboard)
 * - Admin name display
 * - Logout button
 * - Mobile hamburger menu toggle
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { createBrowserClient } from '@/lib/supabase/client';

export interface AdminHeaderProps extends React.HTMLAttributes<HTMLElement> {
    /**
     * Current admin's name to display
     */
    adminName: string;

    /**
     * Callback when hamburger menu is toggled (mobile)
     */
    onMenuToggle?: () => void;
}

export function AdminHeader({
    adminName,
    onMenuToggle,
    className = '',
    ...props
}: AdminHeaderProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const supabase = createBrowserClient();

            // Clear the admin_session cookie used by middleware FIRST
            document.cookie =
                'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

            await supabase.auth.signOut();

            // Use router.replace instead of push to avoid keeping the page in history
            // Also use window.location for a full page reload to ensure clean state
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoggingOut(false);
        }
    };

    return (
        <header
            className={`bg-white border-b-2 border-black h-16 flex items-center justify-between px-6 ${className}`}
            {...props}
        >
            {/* Mobile Hamburger Menu Button */}
            <button
                type="button"
                onClick={onMenuToggle}
                className="lg:hidden flex flex-col gap-1 hover:opacity-70 transition-opacity"
                aria-label="Toggle navigation menu"
            >
                <div className="w-6 h-0.5 bg-black"></div>
                <div className="w-6 h-0.5 bg-black"></div>
                <div className="w-6 h-0.5 bg-black"></div>
            </button>

            {/* Logo */}
            <Link
                href="/admin"
                className="flex items-center gap-2 hover:opacity-70 transition-opacity font-bold text-lg admin-header-title"
                aria-label="Dashboard"
            >
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
                    YOA
                </div>
                <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {/* Admin Name (Hidden on Mobile) */}
            <div className="hidden md:flex flex-1 justify-center">
                <span className="text-gray-700">{adminName}</span>
            </div>

            {/* Logout Button */}
            <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                size="sm"
                className="ml-auto"
                aria-label="Logout"
            >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
        </header>
    );
}

/**
 * Login Layout (Server Component)
 *
 * Minimal layout for the login page that bypasses the admin layout.
 * This layout does not require authentication and allows users to access
 * the login page without an admin session cookie.
 */

import React from 'react';

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Return children directly without any admin layout wrapper
    // This ensures the login page doesn't check for admin_session cookie
    return <>{children}</>;
}

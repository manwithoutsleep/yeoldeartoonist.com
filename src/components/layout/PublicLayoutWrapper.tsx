'use client';

/**
 * PublicLayoutWrapper
 *
 * Conditionally wraps pages with the public site header, navigation, and footer.
 * Admin pages (/admin/*) are rendered without these components, allowing the
 * admin layout to provide its own header and navigation.
 *
 * This component is used in the root layout to prevent the public navigation
 * from appearing on admin pages while keeping it on all public pages.
 */

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

interface PublicLayoutWrapperProps {
    children: React.ReactNode;
}

export function PublicLayoutWrapper({ children }: PublicLayoutWrapperProps) {
    const pathname = usePathname();

    // Check if we're on an admin page
    const isAdminPage = pathname?.startsWith('/admin');

    // Admin pages: render children without public header/nav/footer
    if (isAdminPage) {
        return <>{children}</>;
    }

    // Public pages: render with header, navigation, and footer
    return (
        <div className="public-layout">
            <Header />
            <Navigation />
            <main>{children}</main>
            <Footer />
        </div>
    );
}

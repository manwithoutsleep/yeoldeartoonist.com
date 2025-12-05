'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import CartButton to avoid SSR issues with localStorage
// Loading component prevents layout shift
const CartButton = dynamic(
    () =>
        import('@/components/cart/CartButton').then((mod) => ({
            default: mod.CartButton,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="w-10 h-10" aria-hidden="true">
                {/* Placeholder matching CartButton dimensions */}
            </div>
        ),
    }
);

/**
 * Header component - displays site logo and branding
 *
 * Features:
 * - White background with black text
 * - Responsive design
 * - Logo from static assets
 * - Shopping cart button (top-right)
 * - Prevents layout shift with CartButton placeholder
 */
export function Header() {
    return (
        <header className="w-full bg-white border-b-2 border-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
                <div className="flex items-center justify-between">
                    {/* Spacer for alignment */}
                    <div className="w-10" aria-hidden="true" />

                    {/* Logo (centered) */}
                    <Link
                        href="/"
                        className="max-w-[150px] sm:max-w-[220px] lg:max-w-none flex-shrink-0"
                    >
                        <Image
                            src="/images/header-footer/logo.webp"
                            alt="Ye Olde Artoonist Logo"
                            width={300}
                            height={189}
                            priority
                            className="h-auto w-full"
                        />
                    </Link>

                    {/* Cart Button (right-aligned) */}
                    <CartButton />
                </div>
            </div>
        </header>
    );
}

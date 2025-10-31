import Image from 'next/image';
import Link from 'next/link';

/**
 * Header component - displays site logo and branding
 *
 * Features:
 * - White background with black text
 * - Responsive design
 * - Logo from static assets
 */
export function Header() {
    return (
        <header className="w-full bg-white border-b-2 border-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
                <div className="flex items-center justify-center">
                    <Link
                        href="/"
                        className="max-w-[150px] sm:max-w-[220px] lg:max-w-none"
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
                </div>
            </div>
        </header>
    );
}

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
        <header className="w-full bg-white border-b border-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-center">
                    <Link href="/">
                        <div className="relative w-full max-w-full">
                            <Image
                                src="/images/header-footer/logo.webp"
                                alt="Ye Olde Artoonist Logo"
                                width={300}
                                height={189}
                                priority
                                className="h-auto w-full lg:w-auto"
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}

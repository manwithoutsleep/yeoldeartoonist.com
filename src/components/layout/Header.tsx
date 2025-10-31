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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-center min-h-[80px]">
                    <Link href="/">
                        <div className="relative w-full max-w-[300px] lg:max-w-full">
                            <Image
                                src="/images/header-footer/logo.webp"
                                alt="Ye Olde Artoonist Logo"
                                width={300}
                                height={189}
                                priority
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                }}
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}

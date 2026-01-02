import type { Metadata } from 'next';
import { Geist, Geist_Mono, Germania_One } from 'next/font/google';
import './globals.css';
import { PublicLayoutWrapper } from '@/components/layout/PublicLayoutWrapper';
import { siteConfig } from '@/config/site';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const germaniaOne = Germania_One({
    variable: '--font-germania-one',
    weight: '400',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        default: siteConfig.site.title,
        template: `%s - ${siteConfig.site.title}`,
    },
    description: siteConfig.site.description,
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    ),
    keywords: [
        'original art',
        'art prints',
        'artist',
        'illustration',
        'artwork',
        'gallery',
        siteConfig.artist.name,
    ],
    authors: [{ name: siteConfig.artist.name }],
    creator: siteConfig.artist.name,
    openGraph: {
        title: siteConfig.site.title,
        description: siteConfig.site.description,
        url: siteConfig.site.url,
        siteName: siteConfig.site.title,
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: siteConfig.site.title,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.site.title,
        description: siteConfig.site.description,
        images: ['/og-image.jpg'],
        creator: '@ye_olde_artoonist',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                {/* Resource Hints (Phase C - C.3 Font Loading Optimization) */}
                {/* Preconnect to Google Fonts CDN for faster font loading */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${germaniaOne.variable} antialiased`}
            >
                {/* Skip to main content link for keyboard navigation accessibility */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                    Skip to main content
                </a>
                <PublicLayoutWrapper>{children}</PublicLayoutWrapper>

                {/* Non-critical scripts placed at end of body (Phase C - C.2 Script Loading) */}
                {/* All third-party scripts should be loaded here with defer/async attributes */}
                {/* Future: Stripe and analytics scripts will be placed here when added in Phase 3+ */}
                {/* Note: Currently no third-party scripts are loaded. When adding new scripts: */}
                {/* - Use defer attribute for non-critical scripts that need DOM access */}
                {/* - Use async attribute for independent scripts like analytics */}
                {/* - Load scripts at end of body to prevent render-blocking */}
            </body>
        </html>
    );
}

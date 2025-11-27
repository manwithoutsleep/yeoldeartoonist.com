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
    title: siteConfig.site.title,
    description: siteConfig.site.description,
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    ),
    openGraph: {
        title: siteConfig.site.title,
        description: siteConfig.site.description,
        url: siteConfig.site.url,
        type: 'website',
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

                {/* Critical CSS Inlining (Phase C - C.1 Critical CSS) */}
                {/* Inline critical above-the-fold styles to prevent render-blocking */}
                {/* This includes essential layout, typography, and visual hierarchy for hero section */}
                <style>{`
                    /* Critical above-the-fold styles */
                    * {
                        box-sizing: border-box;
                    }

                    html {
                        font-size: 16px;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        font-family: var(--font-germania-one, Arial, Helvetica, sans-serif);
                        font-size: 1rem;
                        line-height: 1.5;
                        background: var(--background, #ffffff);
                        color: var(--foreground, #171717);
                        transition: color 0.3s ease, background-color 0.3s ease;
                    }

                    /* Prevent layout shift during font swap */
                    @supports (font-variation-settings: normal) {
                        html {
                            font-display: swap;
                        }
                    }

                    /* Critical header and nav sizing to prevent layout shifts (Phase E) */
                    /* Note: Scoped to avoid affecting admin components */
                    .public-layout header {
                        min-height: 80px;
                        display: block;
                        width: 100%;
                    }

                    .public-layout nav {
                        min-height: 120px;
                        display: block;
                        width: 100%;
                    }

                    main {
                        display: block;
                        width: 100%;
                    }

                    footer {
                        display: block;
                        width: 100%;
                    }

                    /* Ensure images scale properly and don't cause layout shifts */
                    img {
                        display: block;
                        max-width: 100%;
                        height: auto;
                    }

                    /* Critical heading styles */
                    h1, h2, h3, h4, h5, h6 {
                        margin: 0;
                        font-family: var(--font-germania-one, Arial, Helvetica, sans-serif);
                        font-weight: 400;
                    }

                    /* Dark mode support (critical for above-the-fold) */
                    /* IMPORTANT: Admin pages always use light mode regardless of system preference */
                    @media (prefers-color-scheme: dark) {
                        :root:not(.light-mode) {
                            --background: #0a0a0a;
                            --foreground: #ededed;
                        }
                    }
                `}</style>
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${germaniaOne.variable} antialiased`}
            >
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

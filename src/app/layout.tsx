import type { Metadata } from 'next';
import { Geist, Geist_Mono, Germania_One } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

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
    title: 'Ye Olde Artoonist',
    description:
        'Original cartoon artwork and fine art by Ye Olde Artoonist. Shop unique pieces, explore galleries, and discover upcoming projects and events.',
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    ),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${germaniaOne.variable} antialiased`}
            >
                <Header />
                <Navigation />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}

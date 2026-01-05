import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { StructuredData } from '@/components/seo/StructuredData';
import { getWebPageSchema, getPersonSchema } from '@/lib/seo/structured-data';
import ContactClient from './ContactClient';

/**
 * Contact page - Meet The Artist
 *
 * Server component wrapper that provides SEO metadata
 * and renders the client-side contact form component
 */

export const metadata: Metadata = {
    title: `Contact ${siteConfig.artist.name}`,
    description: `Get in touch with ${siteConfig.artist.name} for commissions, inquiries, or to discuss your next art project. View artist bio and contact information.`,
    openGraph: {
        title: `Contact ${siteConfig.artist.name} - ${siteConfig.site.title}`,
        description: `Get in touch with ${siteConfig.artist.name} for commissions and inquiries`,
        url: `${siteConfig.site.url}/contact`,
        type: 'website',
        images: [
            {
                url: '/images/section-headers/contact.webp',
                width: 1200,
                height: 630,
                alt: 'Contact Ye Olde Artoonist',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Contact ${siteConfig.artist.name} - ${siteConfig.site.title}`,
        description: `Get in touch with ${siteConfig.artist.name} for commissions and inquiries`,
        images: ['/images/section-headers/contact.webp'],
    },
};

// ISR revalidation: Contact page content rarely changes
export const revalidate = 86400; // 24 hours

export default function ContactPage() {
    return (
        <>
            <StructuredData
                data={[
                    getWebPageSchema({
                        name: `Contact ${siteConfig.artist.name}`,
                        description: `Get in touch with ${siteConfig.artist.name} for commissions and inquiries`,
                        url: `${siteConfig.site.url}/contact`,
                    }),
                    getPersonSchema(),
                ]}
            />
            <ContactClient />
        </>
    );
}

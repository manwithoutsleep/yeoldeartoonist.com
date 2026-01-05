/**
 * Structured Data (Schema.org) helpers for SEO
 * Generate JSON-LD structured data for different page types
 */

import { siteConfig } from '@/config/site';

/**
 * Base JSON-LD context
 */
const JSON_LD_CONTEXT = 'https://schema.org';

/**
 * Organization structured data - used on all pages
 */
export function getOrganizationSchema() {
    return {
        '@context': JSON_LD_CONTEXT,
        '@type': 'Organization',
        name: siteConfig.site.title,
        url: siteConfig.site.url,
        logo: `${siteConfig.site.url}/images/logo.jpg`,
        description: siteConfig.site.description,
        sameAs: siteConfig.socialMedia.sites.map((site) => site.href),
        contactPoint: {
            '@type': 'ContactPoint',
            email: siteConfig.artist.email,
            contactType: 'customer service',
        },
    };
}

/**
 * WebPage structured data - used on all pages
 */
export function getWebPageSchema(params: {
    name: string;
    description: string;
    url: string;
}) {
    return {
        '@context': JSON_LD_CONTEXT,
        '@type': 'WebPage',
        name: params.name,
        description: params.description,
        url: params.url,
        inLanguage: 'en-US',
        isPartOf: {
            '@type': 'WebSite',
            name: siteConfig.site.title,
            url: siteConfig.site.url,
        },
    };
}

/**
 * Product structured data - used for shop items
 */
export function getProductSchema(params: {
    name: string;
    description: string;
    image: string;
    price: number;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    url: string;
}) {
    return {
        '@context': JSON_LD_CONTEXT,
        '@type': 'Product',
        name: params.name,
        description: params.description,
        image: params.image,
        url: params.url,
        offers: {
            '@type': 'Offer',
            price: params.price.toFixed(2),
            priceCurrency: 'USD',
            availability: `https://schema.org/${params.availability}`,
            url: params.url,
        },
        brand: {
            '@type': 'Brand',
            name: siteConfig.site.title,
        },
    };
}

/**
 * Person/Artist structured data - used on contact page
 */
export function getPersonSchema() {
    return {
        '@context': JSON_LD_CONTEXT,
        '@type': 'Person',
        name: siteConfig.artist.name,
        email: siteConfig.artist.email,
        url: siteConfig.site.url,
        image: `${siteConfig.site.url}/images/pages/meet-the-artist.webp`,
        jobTitle: 'Artist',
        description: siteConfig.artist.bio,
        address: {
            '@type': 'PostalAddress',
            addressLocality: siteConfig.artist.mailingAddress.city,
            addressRegion: siteConfig.artist.mailingAddress.state,
            postalCode: siteConfig.artist.mailingAddress.zip,
            addressCountry: siteConfig.artist.mailingAddress.country,
        },
        sameAs: siteConfig.socialMedia.sites.map((site) => site.href),
    };
}

/**
 * ImageObject structured data - used for artwork
 */
export function getImageObjectSchema(params: {
    name: string;
    description?: string;
    url: string;
    width?: number;
    height?: number;
    author?: string;
}) {
    return {
        '@context': JSON_LD_CONTEXT,
        '@type': 'ImageObject',
        name: params.name,
        description: params.description,
        contentUrl: params.url,
        url: params.url,
        ...(params.width && { width: params.width }),
        ...(params.height && { height: params.height }),
        author: {
            '@type': 'Person',
            name: params.author || siteConfig.artist.name,
        },
    };
}

/**
 * BreadcrumbList structured data - used for navigation
 */
export function getBreadcrumbSchema(
    breadcrumbs: Array<{ name: string; url: string }>
) {
    return {
        '@context': JSON_LD_CONTEXT,
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    };
}

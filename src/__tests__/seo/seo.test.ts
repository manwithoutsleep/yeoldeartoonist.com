/**
 * SEO implementation tests
 * Tests for metadata, structured data, sitemap, and robots.txt
 */

import { describe, it, expect } from 'vitest';
import { siteConfig } from '@/config/site';
import {
    getOrganizationSchema,
    getWebPageSchema,
    getProductSchema,
    getPersonSchema,
    getImageObjectSchema,
    getBreadcrumbSchema,
} from '@/lib/seo/structured-data';

describe('SEO - Structured Data', () => {
    describe('getOrganizationSchema', () => {
        it('should return valid Organization schema', () => {
            const schema = getOrganizationSchema();

            expect(schema['@context']).toBe('https://schema.org');
            expect(schema['@type']).toBe('Organization');
            expect(schema.name).toBe(siteConfig.site.title);
            expect(schema.url).toBe(siteConfig.site.url);
            expect(schema.logo).toContain('/images/logo.jpg');
            expect(schema.sameAs).toBeInstanceOf(Array);
            expect(schema.contactPoint).toBeDefined();
            expect(schema.contactPoint.email).toBe(siteConfig.artist.email);
        });
    });

    describe('getWebPageSchema', () => {
        it('should return valid WebPage schema', () => {
            const schema = getWebPageSchema({
                name: 'Test Page',
                description: 'Test description',
                url: 'https://example.com/test',
            });

            expect(schema['@context']).toBe('https://schema.org');
            expect(schema['@type']).toBe('WebPage');
            expect(schema.name).toBe('Test Page');
            expect(schema.description).toBe('Test description');
            expect(schema.url).toBe('https://example.com/test');
            expect(schema.inLanguage).toBe('en-US');
            expect(schema.isPartOf).toBeDefined();
            expect(schema.isPartOf['@type']).toBe('WebSite');
        });
    });

    describe('getProductSchema', () => {
        it('should return valid Product schema', () => {
            const schema = getProductSchema({
                name: 'Test Product',
                description: 'Test description',
                image: 'https://example.com/image.jpg',
                price: 29.99,
                availability: 'InStock',
                url: 'https://example.com/product',
            });

            expect(schema['@context']).toBe('https://schema.org');
            expect(schema['@type']).toBe('Product');
            expect(schema.name).toBe('Test Product');
            expect(schema.offers).toBeDefined();
            expect(schema.offers.price).toBe('29.99');
            expect(schema.offers.priceCurrency).toBe('USD');
            expect(schema.offers.availability).toBe(
                'https://schema.org/InStock'
            );
        });

        it('should handle OutOfStock availability', () => {
            const schema = getProductSchema({
                name: 'Test Product',
                description: 'Test description',
                image: 'https://example.com/image.jpg',
                price: 29.99,
                availability: 'OutOfStock',
                url: 'https://example.com/product',
            });

            expect(schema.offers.availability).toBe(
                'https://schema.org/OutOfStock'
            );
        });
    });

    describe('getPersonSchema', () => {
        it('should return valid Person schema', () => {
            const schema = getPersonSchema();

            expect(schema['@context']).toBe('https://schema.org');
            expect(schema['@type']).toBe('Person');
            expect(schema.name).toBe(siteConfig.artist.name);
            expect(schema.email).toBe(siteConfig.artist.email);
            expect(schema.jobTitle).toBe('Artist');
            expect(schema.address).toBeDefined();
            expect(schema.address['@type']).toBe('PostalAddress');
            expect(schema.address.addressLocality).toBe(
                siteConfig.artist.mailingAddress.city
            );
        });
    });

    describe('getImageObjectSchema', () => {
        it('should return valid ImageObject schema', () => {
            const schema = getImageObjectSchema({
                name: 'Test Image',
                description: 'Test description',
                url: 'https://example.com/image.jpg',
                width: 1200,
                height: 630,
                author: 'Test Author',
            });

            expect(schema['@context']).toBe('https://schema.org');
            expect(schema['@type']).toBe('ImageObject');
            expect(schema.name).toBe('Test Image');
            expect(schema.width).toBe(1200);
            expect(schema.height).toBe(630);
            expect(schema.author.name).toBe('Test Author');
        });

        it('should use default author if not provided', () => {
            const schema = getImageObjectSchema({
                name: 'Test Image',
                url: 'https://example.com/image.jpg',
            });

            expect(schema.author.name).toBe(siteConfig.artist.name);
        });
    });

    describe('getBreadcrumbSchema', () => {
        it('should return valid BreadcrumbList schema', () => {
            const breadcrumbs = [
                { name: 'Home', url: 'https://example.com' },
                { name: 'Gallery', url: 'https://example.com/gallery' },
                {
                    name: 'Artwork',
                    url: 'https://example.com/gallery/artwork',
                },
            ];

            const schema = getBreadcrumbSchema(breadcrumbs);

            expect(schema['@context']).toBe('https://schema.org');
            expect(schema['@type']).toBe('BreadcrumbList');
            expect(schema.itemListElement).toHaveLength(3);
            expect(schema.itemListElement[0].position).toBe(1);
            expect(schema.itemListElement[0].name).toBe('Home');
            expect(schema.itemListElement[2].position).toBe(3);
            expect(schema.itemListElement[2].name).toBe('Artwork');
        });
    });
});

describe('SEO - Site Configuration', () => {
    it('should have valid site configuration', () => {
        expect(siteConfig.site.title).toBeDefined();
        expect(siteConfig.site.description).toBeDefined();
        expect(siteConfig.site.url).toContain('https://');
        expect(siteConfig.artist.name).toBeDefined();
        expect(siteConfig.artist.email).toContain('@');
    });

    it('should have social media links', () => {
        expect(siteConfig.socialMedia.sites).toBeInstanceOf(Array);
        expect(siteConfig.socialMedia.sites.length).toBeGreaterThan(0);
        siteConfig.socialMedia.sites.forEach((site) => {
            expect(site.title).toBeDefined();
            expect(site.href).toContain('https://');
        });
    });
});

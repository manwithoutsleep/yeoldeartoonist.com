/**
 * Tests for structured data helpers
 * Following TDD approach for Step 7 of Issue #57
 */

import { describe, it, expect } from 'vitest';
import {
    getProductSchema,
    getWebPageSchema,
    getOrganizationSchema,
    getPersonSchema,
    getImageObjectSchema,
    getBreadcrumbSchema,
} from '@/lib/seo/structured-data';

describe('getProductSchema', () => {
    it('should generate valid Product schema with required fields', () => {
        const result = getProductSchema({
            name: 'Test Product',
            description: 'A test product description',
            image: 'https://example.com/image.jpg',
            price: 99.99,
            availability: 'InStock',
            url: 'https://example.com/product',
        });

        expect(result).toMatchObject({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Test Product',
            description: 'A test product description',
            image: 'https://example.com/image.jpg',
            url: 'https://example.com/product',
        });
    });

    it('should include availability status (InStock)', () => {
        const result = getProductSchema({
            name: 'In Stock Product',
            description: 'Available product',
            image: 'https://example.com/image.jpg',
            price: 49.99,
            availability: 'InStock',
            url: 'https://example.com/product',
        });

        expect(result.offers.availability).toBe('https://schema.org/InStock');
    });

    it('should include availability status (OutOfStock)', () => {
        const result = getProductSchema({
            name: 'Out of Stock Product',
            description: 'Unavailable product',
            image: 'https://example.com/image.jpg',
            price: 49.99,
            availability: 'OutOfStock',
            url: 'https://example.com/product',
        });

        expect(result.offers.availability).toBe(
            'https://schema.org/OutOfStock'
        );
    });

    it('should include availability status (PreOrder)', () => {
        const result = getProductSchema({
            name: 'PreOrder Product',
            description: 'Coming soon product',
            image: 'https://example.com/image.jpg',
            price: 149.99,
            availability: 'PreOrder',
            url: 'https://example.com/product',
        });

        expect(result.offers.availability).toBe('https://schema.org/PreOrder');
    });

    it('should include price and currency', () => {
        const result = getProductSchema({
            name: 'Priced Product',
            description: 'Product with pricing',
            image: 'https://example.com/image.jpg',
            price: 123.45,
            availability: 'InStock',
            url: 'https://example.com/product',
        });

        expect(result.offers).toMatchObject({
            '@type': 'Offer',
            price: '123.45',
            priceCurrency: 'USD',
        });
    });

    it('should include image URL', () => {
        const imageUrl = 'https://example.com/product-image.jpg';
        const result = getProductSchema({
            name: 'Image Product',
            description: 'Product with image',
            image: imageUrl,
            price: 29.99,
            availability: 'InStock',
            url: 'https://example.com/product',
        });

        expect(result.image).toBe(imageUrl);
    });

    it('should handle missing optional fields gracefully', () => {
        const result = getProductSchema({
            name: 'Minimal Product',
            description: '',
            image: 'https://example.com/image.jpg',
            price: 19.99,
            availability: 'InStock',
            url: 'https://example.com/product',
        });

        // Should still have all required fields
        expect(result).toHaveProperty('@context');
        expect(result).toHaveProperty('@type');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('image');
        expect(result).toHaveProperty('offers');
        expect(result.description).toBe('');
    });

    it('should format price to 2 decimal places', () => {
        const result = getProductSchema({
            name: 'Decimal Product',
            description: 'Product with decimal price',
            image: 'https://example.com/image.jpg',
            price: 99.9,
            availability: 'InStock',
            url: 'https://example.com/product',
        });

        expect(result.offers.price).toBe('99.90');
    });

    it('should include brand information', () => {
        const result = getProductSchema({
            name: 'Branded Product',
            description: 'Product with brand',
            image: 'https://example.com/image.jpg',
            price: 199.99,
            availability: 'InStock',
            url: 'https://example.com/product',
        });

        expect(result).toHaveProperty('brand');
        expect(result.brand).toMatchObject({
            '@type': 'Brand',
        });
        expect(result.brand).toHaveProperty('name');
    });

    it('should include product URL in offers', () => {
        const productUrl = 'https://example.com/special-product';
        const result = getProductSchema({
            name: 'URL Product',
            description: 'Product with URL',
            image: 'https://example.com/image.jpg',
            price: 79.99,
            availability: 'InStock',
            url: productUrl,
        });

        expect(result.offers.url).toBe(productUrl);
    });

    it('should include SKU when provided', () => {
        const result = getProductSchema({
            name: 'Product with SKU',
            description: 'Product with SKU code',
            image: 'https://example.com/image.jpg',
            price: 59.99,
            availability: 'InStock',
            url: 'https://example.com/product',
            sku: 'ART-12345',
        });

        expect(result).toHaveProperty('sku');
        expect(result.sku).toBe('ART-12345');
    });

    it('should omit SKU when not provided', () => {
        const result = getProductSchema({
            name: 'Product without SKU',
            description: 'Product without SKU code',
            image: 'https://example.com/image.jpg',
            price: 59.99,
            availability: 'InStock',
            url: 'https://example.com/product',
        });

        expect(result).not.toHaveProperty('sku');
    });
});

describe('getWebPageSchema', () => {
    it('should generate valid WebPage schema', () => {
        const result = getWebPageSchema({
            name: 'Test Page',
            description: 'A test page',
            url: 'https://example.com/page',
        });

        expect(result).toMatchObject({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Test Page',
            description: 'A test page',
            url: 'https://example.com/page',
            inLanguage: 'en-US',
        });
    });

    it('should include isPartOf WebSite reference', () => {
        const result = getWebPageSchema({
            name: 'Test Page',
            description: 'A test page',
            url: 'https://example.com/page',
        });

        expect(result.isPartOf).toMatchObject({
            '@type': 'WebSite',
        });
        expect(result.isPartOf).toHaveProperty('name');
        expect(result.isPartOf).toHaveProperty('url');
    });
});

describe('getOrganizationSchema', () => {
    it('should generate valid Organization schema', () => {
        const result = getOrganizationSchema();

        expect(result).toMatchObject({
            '@context': 'https://schema.org',
            '@type': 'Organization',
        });
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('logo');
        expect(result).toHaveProperty('description');
    });

    it('should include contact point', () => {
        const result = getOrganizationSchema();

        expect(result.contactPoint).toMatchObject({
            '@type': 'ContactPoint',
            contactType: 'customer service',
        });
        expect(result.contactPoint).toHaveProperty('email');
    });

    it('should include social media links', () => {
        const result = getOrganizationSchema();

        expect(result.sameAs).toBeDefined();
        expect(Array.isArray(result.sameAs)).toBe(true);
    });
});

describe('getPersonSchema', () => {
    it('should generate valid Person schema', () => {
        const result = getPersonSchema();

        expect(result).toMatchObject({
            '@context': 'https://schema.org',
            '@type': 'Person',
            jobTitle: 'Artist',
        });
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('url');
    });

    it('should include postal address', () => {
        const result = getPersonSchema();

        expect(result.address).toMatchObject({
            '@type': 'PostalAddress',
        });
        expect(result.address).toHaveProperty('addressLocality');
        expect(result.address).toHaveProperty('addressRegion');
        expect(result.address).toHaveProperty('postalCode');
        expect(result.address).toHaveProperty('addressCountry');
    });

    it('should include social media links', () => {
        const result = getPersonSchema();

        expect(result.sameAs).toBeDefined();
        expect(Array.isArray(result.sameAs)).toBe(true);
    });
});

describe('getImageObjectSchema', () => {
    it('should generate valid ImageObject schema with required fields', () => {
        const result = getImageObjectSchema({
            name: 'Test Image',
            url: 'https://example.com/image.jpg',
        });

        expect(result).toMatchObject({
            '@context': 'https://schema.org',
            '@type': 'ImageObject',
            name: 'Test Image',
            contentUrl: 'https://example.com/image.jpg',
            url: 'https://example.com/image.jpg',
        });
    });

    it('should include optional description', () => {
        const result = getImageObjectSchema({
            name: 'Test Image',
            description: 'A test image description',
            url: 'https://example.com/image.jpg',
        });

        expect(result.description).toBe('A test image description');
    });

    it('should include optional dimensions', () => {
        const result = getImageObjectSchema({
            name: 'Test Image',
            url: 'https://example.com/image.jpg',
            width: 1200,
            height: 800,
        });

        expect(result.width).toBe(1200);
        expect(result.height).toBe(800);
    });

    it('should include author information', () => {
        const result = getImageObjectSchema({
            name: 'Test Image',
            url: 'https://example.com/image.jpg',
            author: 'Test Artist',
        });

        expect(result.author).toMatchObject({
            '@type': 'Person',
            name: 'Test Artist',
        });
    });

    it('should use default author if not provided', () => {
        const result = getImageObjectSchema({
            name: 'Test Image',
            url: 'https://example.com/image.jpg',
        });

        expect(result.author).toMatchObject({
            '@type': 'Person',
        });
        expect(result.author).toHaveProperty('name');
    });
});

describe('getBreadcrumbSchema', () => {
    it('should generate valid BreadcrumbList schema', () => {
        const breadcrumbs = [
            { name: 'Home', url: 'https://example.com' },
            { name: 'Products', url: 'https://example.com/products' },
            { name: 'Product', url: 'https://example.com/products/1' },
        ];

        const result = getBreadcrumbSchema(breadcrumbs);

        expect(result).toMatchObject({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
        });
        expect(result.itemListElement).toHaveLength(3);
    });

    it('should correctly position breadcrumb items', () => {
        const breadcrumbs = [
            { name: 'Home', url: 'https://example.com' },
            { name: 'Products', url: 'https://example.com/products' },
        ];

        const result = getBreadcrumbSchema(breadcrumbs);

        expect(result.itemListElement[0]).toMatchObject({
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://example.com',
        });
        expect(result.itemListElement[1]).toMatchObject({
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: 'https://example.com/products',
        });
    });

    it('should handle empty breadcrumb list', () => {
        const result = getBreadcrumbSchema([]);

        expect(result.itemListElement).toHaveLength(0);
    });
});

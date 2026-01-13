/**
 * Tests for StructuredData component
 *
 * Comprehensive test suite for the StructuredData component, covering:
 * - Nonce attribute application to script tags
 * - JSON-LD output formatting
 * - Single and multiple schema rendering
 * - Edge cases and error handling
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StructuredData } from '@/components/seo/StructuredData';
import { NonceProvider } from '@/context/NonceContext';

// Mock Next.js Script component to render actual script tags in tests
vi.mock('next/script', () => ({
    default: ({
        id,
        type,
        nonce,
        dangerouslySetInnerHTML,
    }: {
        id?: string;
        type?: string;
        nonce?: string;
        dangerouslySetInnerHTML?: { __html: string };
    }) => {
        return React.createElement('script', {
            id,
            type,
            nonce,
            dangerouslySetInnerHTML,
        });
    },
}));

describe('StructuredData', () => {
    describe('Nonce Attribute', () => {
        it('should apply nonce to script tag when nonce is provided', () => {
            const schema = { '@type': 'Organization', name: 'Test Org' };
            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script).toBeTruthy();
            expect(script).toHaveAttribute('nonce', 'test-nonce');
        });

        it('should work without nonce when nonce is undefined', () => {
            const schema = { '@type': 'Organization', name: 'Test Org' };
            const { container } = render(
                <NonceProvider>
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script).toBeTruthy();
            expect(script).toHaveAttribute('type', 'application/ld+json');
        });

        it('should work when rendered outside NonceProvider', () => {
            const schema = { '@type': 'Organization', name: 'Test Org' };
            const { container } = render(<StructuredData data={schema} />);

            const script = container.querySelector('script');
            expect(script).toBeTruthy();
            expect(script).toHaveAttribute('type', 'application/ld+json');
        });

        it('should apply different nonces to multiple StructuredData components', () => {
            const schema1 = { '@type': 'Organization', name: 'Org 1' };
            const schema2 = { '@type': 'Organization', name: 'Org 2' };

            const { container } = render(
                <NonceProvider nonce="shared-nonce">
                    <StructuredData data={schema1} />
                    <StructuredData data={schema2} />
                </NonceProvider>
            );

            const scripts = container.querySelectorAll('script');
            expect(scripts).toHaveLength(2);
            scripts.forEach((script) => {
                expect(script).toHaveAttribute('nonce', 'shared-nonce');
            });
        });
    });

    describe('JSON-LD Output', () => {
        it('should correctly format simple schema as JSON-LD', () => {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Test Organization',
            };

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema));
        });

        it('should correctly format complex nested schema', () => {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Test Site',
                url: 'https://example.com',
                publisher: {
                    '@type': 'Organization',
                    name: 'Publisher Name',
                    logo: {
                        '@type': 'ImageObject',
                        url: 'https://example.com/logo.png',
                    },
                },
            };

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema));
        });

        it('should handle schema with arrays', () => {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Gallery',
                    },
                ],
            };

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema));
        });

        it('should preserve special characters in JSON output', () => {
            const schema = {
                '@type': 'Organization',
                name: 'Test & "Company" (Ltd)',
                description: "It's a company with special chars: @#$%^&*()",
            };

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            // Note: React/DOM may encode angle brackets differently, use parentheses instead
            expect(script?.textContent).toBe(JSON.stringify(schema));
        });
    });

    describe('Single Schema Rendering', () => {
        it('should render single schema with correct attributes', () => {
            const schema = { '@type': 'Organization', name: 'Single Org' };

            const { container } = render(
                <NonceProvider nonce="single-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const scripts = container.querySelectorAll('script');
            expect(scripts).toHaveLength(1);

            const script = scripts[0];
            expect(script).toHaveAttribute('id', 'structured-data-0');
            expect(script).toHaveAttribute('type', 'application/ld+json');
            expect(script).toHaveAttribute('nonce', 'single-nonce');
        });

        it('should render script with correct type attribute', () => {
            const schema = { '@type': 'WebPage', name: 'Test Page' };

            const { container } = render(
                <NonceProvider>
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script).toHaveAttribute('type', 'application/ld+json');
        });
    });

    describe('Multiple Schemas Rendering', () => {
        it('should render multiple schemas with unique IDs', () => {
            const schemas = [
                { '@type': 'Organization', name: 'Org 1' },
                { '@type': 'WebSite', name: 'Site 1' },
                { '@type': 'WebPage', name: 'Page 1' },
            ];

            const { container } = render(
                <NonceProvider nonce="multi-nonce">
                    <StructuredData data={schemas} />
                </NonceProvider>
            );

            const scripts = container.querySelectorAll('script');
            expect(scripts).toHaveLength(3);

            scripts.forEach((script, index) => {
                expect(script).toHaveAttribute(
                    'id',
                    `structured-data-${index}`
                );
                expect(script).toHaveAttribute('nonce', 'multi-nonce');
                expect(script).toHaveAttribute('type', 'application/ld+json');
            });
        });

        it('should render each schema with correct JSON content', () => {
            const schemas = [
                { '@type': 'Organization', name: 'Test Org' },
                {
                    '@type': 'WebSite',
                    name: 'Test Site',
                    url: 'https://test.com',
                },
            ];

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schemas} />
                </NonceProvider>
            );

            const scripts = container.querySelectorAll('script');
            expect(scripts[0]?.textContent).toBe(JSON.stringify(schemas[0]));
            expect(scripts[1]?.textContent).toBe(JSON.stringify(schemas[1]));
        });

        it('should handle empty array of schemas', () => {
            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={[]} />
                </NonceProvider>
            );

            const scripts = container.querySelectorAll('script');
            expect(scripts).toHaveLength(0);
        });

        it('should apply same nonce to all schemas in array', () => {
            const schemas = [
                { '@type': 'Organization', name: 'Org 1' },
                { '@type': 'Organization', name: 'Org 2' },
                { '@type': 'Organization', name: 'Org 3' },
            ];

            const { container } = render(
                <NonceProvider nonce="shared-nonce">
                    <StructuredData data={schemas} />
                </NonceProvider>
            );

            const scripts = container.querySelectorAll('script');
            scripts.forEach((script) => {
                expect(script).toHaveAttribute('nonce', 'shared-nonce');
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty object schema', () => {
            const schema = {};

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script).toBeTruthy();
            expect(script?.textContent).toBe('{}');
        });

        it('should handle schema with null values', () => {
            const schema = {
                '@type': 'Organization',
                name: 'Test',
                logo: null,
                address: null,
            };

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema));
        });

        it('should handle schema with boolean values', () => {
            const schema = {
                '@type': 'Product',
                name: 'Test Product',
                available: true,
                discontinued: false,
            };

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema));
        });

        it('should handle schema with numeric values', () => {
            const schema = {
                '@type': 'Product',
                name: 'Test Product',
                price: 99.99,
                quantity: 10,
                rating: 4.5,
            };

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema));
        });

        it('should handle very large schemas', () => {
            const largeSchema = {
                '@type': 'Organization',
                name: 'Test',
                description: 'a'.repeat(10000),
                employees: Array.from({ length: 100 }, (_, i) => ({
                    '@type': 'Person',
                    name: `Employee ${i}`,
                })),
            };

            const { container } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={largeSchema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(largeSchema));
        });
    });

    describe('Re-rendering Behavior', () => {
        it('should update when schema prop changes', () => {
            const schema1 = { '@type': 'Organization', name: 'Org 1' };
            const schema2 = { '@type': 'Organization', name: 'Org 2' };

            const { container, rerender } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema1} />
                </NonceProvider>
            );

            let script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema1));

            rerender(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema2} />
                </NonceProvider>
            );

            script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema2));
        });

        it('should update when nonce changes', () => {
            const schema = { '@type': 'Organization', name: 'Test' };

            const { container, rerender } = render(
                <NonceProvider nonce="nonce-1">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            let script = container.querySelector('script');
            expect(script).toHaveAttribute('nonce', 'nonce-1');

            rerender(
                <NonceProvider nonce="nonce-2">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            script = container.querySelector('script');
            expect(script).toHaveAttribute('nonce', 'nonce-2');
        });

        it('should maintain script attributes during re-render', () => {
            const schema = { '@type': 'Organization', name: 'Test' };

            const { container, rerender } = render(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const checkAttributes = () => {
                const script = container.querySelector('script');
                expect(script).toHaveAttribute('id', 'structured-data-0');
                expect(script).toHaveAttribute('type', 'application/ld+json');
                expect(script).toHaveAttribute('nonce', 'test-nonce');
            };

            checkAttributes();

            rerender(
                <NonceProvider nonce="test-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            checkAttributes();
        });
    });

    describe('Real-World Schema Examples', () => {
        it('should render Organization schema correctly', () => {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Ye Olde Artoonist',
                url: 'https://yeoldeartoonist.com',
                logo: 'https://yeoldeartoonist.com/logo.png',
                sameAs: [
                    'https://facebook.com/yeoldeartoonist',
                    'https://instagram.com/yeoldeartoonist',
                ],
            };

            const { container } = render(
                <NonceProvider nonce="org-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema));
            expect(script).toHaveAttribute('nonce', 'org-nonce');
        });

        it('should render Product schema correctly', () => {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: 'Original Artwork',
                image: 'https://example.com/artwork.jpg',
                description: 'A beautiful piece of art',
                offers: {
                    '@type': 'Offer',
                    price: '500.00',
                    priceCurrency: 'USD',
                    availability: 'https://schema.org/InStock',
                },
            };

            const { container } = render(
                <NonceProvider nonce="product-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema));
        });

        it('should render BreadcrumbList schema correctly', () => {
            const schema = {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: 'https://example.com',
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Gallery',
                        item: 'https://example.com/gallery',
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: 'Artwork',
                    },
                ],
            };

            const { container } = render(
                <NonceProvider nonce="breadcrumb-nonce">
                    <StructuredData data={schema} />
                </NonceProvider>
            );

            const script = container.querySelector('script');
            expect(script?.textContent).toBe(JSON.stringify(schema));
        });
    });
});

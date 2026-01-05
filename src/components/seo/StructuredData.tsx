/**
 * StructuredData component
 * Renders JSON-LD structured data in a script tag for SEO
 */

import Script from 'next/script';

interface StructuredDataProps {
    data: object | object[];
}

/**
 * Component for rendering JSON-LD structured data
 *
 * Usage:
 * ```tsx
 * <StructuredData data={getOrganizationSchema()} />
 * ```
 *
 * Multiple schemas:
 * ```tsx
 * <StructuredData data={[getOrganizationSchema(), getWebPageSchema(...)]} />
 * ```
 */
export function StructuredData({ data }: StructuredDataProps) {
    const jsonLd = Array.isArray(data) ? data : [data];

    return (
        <>
            {jsonLd.map((schema, index) => (
                <Script
                    key={index}
                    id={`structured-data-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema),
                    }}
                />
            ))}
        </>
    );
}

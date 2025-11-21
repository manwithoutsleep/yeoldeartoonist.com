import { z } from 'zod';

export const artworkSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'Slug must be lowercase with hyphens'
        ),
    description: z.string().optional().nullable(),
    price: z.string().refine(
        (val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num >= 0;
        },
        { message: 'Price must be a valid positive number' }
    ),
    original_price: z
        .string()
        .optional()
        .nullable()
        .refine(
            (val) => {
                if (!val) return true;
                const num = parseFloat(val);
                return !isNaN(num) && num >= 0;
            },
            { message: 'Original price must be a valid positive number' }
        ),
    sku: z.string().optional().nullable(),
    inventory_count: z
        .number()
        .int()
        .min(0, 'Inventory count must be non-negative'),
    is_limited_edition: z.boolean(),
    medium: z.string().optional().nullable(),
    dimensions: z.string().optional().nullable(),
    year_created: z.number().int().optional().nullable(),
    image_url: z.string().optional().nullable(),
    image_thumbnail_url: z.string().optional().nullable(),
    image_large_url: z.string().optional().nullable(),
    is_published: z.boolean(),
    is_featured: z.boolean(),
    display_order: z.number().int(),
    alt_text: z.string().optional().nullable(),
    seo_title: z.string().optional().nullable(),
    seo_description: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
});

export type ArtworkFormData = z.infer<typeof artworkSchema>;

import { z } from 'zod';

export const projectSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'Slug must be lowercase with hyphens'
        ),
    description: z.string(),
    status: z
        .enum(['planning', 'active', 'completed', 'archived'])
        .optional()
        .default('planning'),
    progress_percentage: z
        .number()
        .int()
        .min(0, 'Progress must be at least 0')
        .max(100, 'Progress must be at most 100')
        .optional()
        .default(0),
    expected_completion_date: z.string().optional().nullable(),
    image_url: z.string().url('Must be a valid URL').optional().nullable(),
    is_published: z.boolean().optional().default(false),
    display_order: z.number().int().optional().default(0),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

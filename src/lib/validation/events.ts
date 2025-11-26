import { z } from 'zod';

export const eventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'Slug must be lowercase with hyphens'
        ),
    description: z.string().optional().nullable(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    location: z.string().min(1, 'Location is required'),
    venue_name: z.string().optional().nullable(),
    booth_number: z.string().optional().nullable(),
    convention_url: z
        .string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal(''))
        .nullable()
        .transform((val) => (val === '' ? null : val)),
    image_url: z.string().url('Must be a valid URL').optional().nullable(),
    is_published: z.boolean().optional().default(false),
});

export type EventFormData = z.infer<typeof eventSchema>;

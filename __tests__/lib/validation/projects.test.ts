import { describe, expect, it } from 'vitest';
import { projectSchema } from '@/lib/validation/projects';

describe('Project Validation Schema', () => {
    it('validates a correct project object with all required fields', () => {
        const validProject = {
            title: 'Valid Project',
            slug: 'valid-project',
            description: 'A test project',
            is_published: true,
            display_order: 0,
        };

        const result = projectSchema.safeParse(validProject);
        expect(result.success).toBe(true);
    });

    it('validates a project with all optional fields', () => {
        const validProject = {
            title: 'Complete Project',
            slug: 'complete-project',
            description: 'A complete project',
            status: 'active' as const,
            progress_percentage: 50,
            expected_completion_date: '2025-12-31',
            image_url: 'https://example.com/image.jpg',
            is_published: true,
            display_order: 1,
        };

        const result = projectSchema.safeParse(validProject);
        expect(result.success).toBe(true);
    });

    it('fails on missing required fields', () => {
        const invalidProject = {
            description: 'Missing title and slug',
        };

        const result = projectSchema.safeParse(invalidProject);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.title).toBeDefined();
            expect(result.error.flatten().fieldErrors.slug).toBeDefined();
        }
    });

    it('validates slug format', () => {
        const invalidSlug = {
            title: 'Invalid Slug',
            slug: 'Invalid Slug With Spaces',
            description: 'Test',
            is_published: true,
            display_order: 0,
        };

        const result = projectSchema.safeParse(invalidSlug);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.slug).toBeDefined();
        }
    });

    it('validates status enum values', () => {
        const invalidStatus = {
            title: 'Invalid Status',
            slug: 'invalid-status',
            description: 'Test',
            status: 'invalid-value',
            is_published: true,
            display_order: 0,
        };

        const result = projectSchema.safeParse(invalidStatus);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.status).toBeDefined();
        }
    });

    it('accepts valid status values', () => {
        const statuses = [
            'planning',
            'active',
            'completed',
            'archived',
        ] as const;

        statuses.forEach((status) => {
            const validProject = {
                title: 'Status Test',
                slug: 'status-test',
                description: 'Test',
                status,
                is_published: true,
                display_order: 0,
            };

            const result = projectSchema.safeParse(validProject);
            expect(result.success).toBe(true);
        });
    });

    it('validates progress_percentage is between 0 and 100', () => {
        const invalidProgress = {
            title: 'Invalid Progress',
            slug: 'invalid-progress',
            description: 'Test',
            progress_percentage: 150,
            is_published: true,
            display_order: 0,
        };

        const result = projectSchema.safeParse(invalidProgress);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.flatten().fieldErrors.progress_percentage
            ).toBeDefined();
        }
    });

    it('validates image_url is a valid URL', () => {
        const invalidUrl = {
            title: 'Invalid URL',
            slug: 'invalid-url',
            description: 'Test',
            image_url: 'not-a-url',
            is_published: true,
            display_order: 0,
        };

        const result = projectSchema.safeParse(invalidUrl);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.image_url).toBeDefined();
        }
    });

    it('validates display_order is an integer', () => {
        const invalidDisplayOrder = {
            title: 'Invalid Display Order',
            slug: 'invalid-display-order',
            description: 'Test',
            display_order: 1.5,
            is_published: true,
        };

        const result = projectSchema.safeParse(invalidDisplayOrder);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.flatten().fieldErrors.display_order
            ).toBeDefined();
        }
    });
});

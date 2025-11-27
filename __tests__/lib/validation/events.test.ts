import { describe, expect, it } from 'vitest';
import { eventSchema } from '@/lib/validation/events';

describe('Event Validation Schema', () => {
    it('validates a correct event object with all required fields', () => {
        const validEvent = {
            title: 'Valid Event',
            slug: 'valid-event',
            start_date: '2025-06-01',
            end_date: '2025-06-03',
            location: 'Convention Center',
            is_published: true,
        };

        const result = eventSchema.safeParse(validEvent);
        expect(result.success).toBe(true);
    });

    it('validates an event with all optional fields', () => {
        const validEvent = {
            title: 'Complete Event',
            slug: 'complete-event',
            description: 'A complete event',
            start_date: '2025-06-01',
            end_date: '2025-06-03',
            location: 'Convention Center',
            venue_name: 'Grand Hall',
            booth_number: 'A123',
            convention_url: 'https://example.com/event',
            image_url: 'https://example.com/image.jpg',
            is_published: true,
        };

        const result = eventSchema.safeParse(validEvent);
        expect(result.success).toBe(true);
    });

    it('fails on missing required fields', () => {
        const invalidEvent = {
            title: 'Missing Fields',
        };

        const result = eventSchema.safeParse(invalidEvent);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.slug).toBeDefined();
            expect(result.error.flatten().fieldErrors.start_date).toBeDefined();
            expect(result.error.flatten().fieldErrors.end_date).toBeDefined();
            expect(result.error.flatten().fieldErrors.location).toBeDefined();
        }
    });

    it('validates slug format', () => {
        const invalidSlug = {
            title: 'Invalid Slug',
            slug: 'Invalid Slug With Spaces',
            start_date: '2025-06-01',
            end_date: '2025-06-03',
            location: 'Test Location',
            is_published: true,
        };

        const result = eventSchema.safeParse(invalidSlug);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.slug).toBeDefined();
        }
    });

    it('validates image_url is a valid URL', () => {
        const invalidUrl = {
            title: 'Invalid URL',
            slug: 'invalid-url',
            start_date: '2025-06-01',
            end_date: '2025-06-03',
            location: 'Test Location',
            image_url: 'not-a-url',
            is_published: true,
        };

        const result = eventSchema.safeParse(invalidUrl);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.image_url).toBeDefined();
        }
    });

    it('validates convention_url is a valid URL', () => {
        const invalidUrl = {
            title: 'Invalid Convention URL',
            slug: 'invalid-convention-url',
            start_date: '2025-06-01',
            end_date: '2025-06-03',
            location: 'Test Location',
            convention_url: 'not-a-url',
            is_published: true,
        };

        const result = eventSchema.safeParse(invalidUrl);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.flatten().fieldErrors.convention_url
            ).toBeDefined();
        }
    });

    it('accepts missing optional fields', () => {
        const validEvent = {
            title: 'Minimal Event',
            slug: 'minimal-event',
            start_date: '2025-06-01',
            end_date: '2025-06-03',
            location: 'Test Location',
            is_published: false,
        };

        const result = eventSchema.safeParse(validEvent);
        expect(result.success).toBe(true);
    });

    it('validates start_date is required', () => {
        const missingStartDate = {
            title: 'No Start Date',
            slug: 'no-start-date',
            end_date: '2025-06-03',
            location: 'Test Location',
            is_published: true,
        };

        const result = eventSchema.safeParse(missingStartDate);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.start_date).toBeDefined();
        }
    });

    it('validates end_date is required', () => {
        const missingEndDate = {
            title: 'No End Date',
            slug: 'no-end-date',
            start_date: '2025-06-01',
            location: 'Test Location',
            is_published: true,
        };

        const result = eventSchema.safeParse(missingEndDate);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.end_date).toBeDefined();
        }
    });

    it('validates location is required', () => {
        const missingLocation = {
            title: 'No Location',
            slug: 'no-location',
            start_date: '2025-06-01',
            end_date: '2025-06-03',
            is_published: true,
        };

        const result = eventSchema.safeParse(missingLocation);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.location).toBeDefined();
        }
    });
});

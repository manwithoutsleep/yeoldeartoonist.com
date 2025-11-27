// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createEvent,
    deleteEvent,
    getAllEventsAdmin,
    getEventById,
    updateEvent,
    type EventInput,
} from '@/lib/db/admin/events';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createServiceRoleClient: vi.fn(),
}));

describe('Admin Event Queries', () => {
    const mockSupabase = {
        from: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof createServiceRoleClient>>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createServiceRoleClient).mockResolvedValue(mockSupabase);
    });

    describe('getAllEventsAdmin', () => {
        it('returns all events without is_published filter', async () => {
            const mockData = [
                {
                    id: '1',
                    title: 'Test Event',
                    slug: 'test-event',
                    description: 'A test event',
                    start_date: '2025-06-01',
                    end_date: '2025-06-03',
                    location: 'Convention Center',
                    venue_name: null,
                    booth_number: null,
                    convention_url: null,
                    image_url: null,
                    is_published: true,
                    created_at: '2025-01-01',
                    updated_at: '2025-01-01',
                },
            ];
            const mockSelect = vi.fn().mockReturnThis();
            const mockRange = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
                count: 1,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                range: mockRange,
            });
            mockRange.mockReturnValue({
                order: mockOrder,
            });

            const result = await getAllEventsAdmin();

            expect(createServiceRoleClient).toHaveBeenCalled();
            expect(mockSupabase.from).toHaveBeenCalledWith('events');
            expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('handles pagination', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockRange = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockResolvedValue({
                data: [],
                error: null,
                count: 0,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                range: mockRange,
            });
            mockRange.mockReturnValue({
                order: mockOrder,
            });

            await getAllEventsAdmin(10, 20);

            expect(mockRange).toHaveBeenCalledWith(20, 29);
        });

        it('returns error on failure', async () => {
            const mockError = { code: '500', message: 'DB Error' };
            const mockSelect = vi.fn().mockReturnThis();
            const mockRange = vi.fn().mockReturnThis();
            const mockOrder = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
                count: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                range: mockRange,
            });
            mockRange.mockReturnValue({
                order: mockOrder,
            });

            const result = await getAllEventsAdmin();

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });

        it('throws error when called from client side', async () => {
            // Simulate browser environment
            const originalWindow = global.window;
            // @ts-expect-error Setting window for test
            global.window = {};

            const result = await getAllEventsAdmin();

            expect(result.data).toBeNull();
            expect(result.error?.code).toBe('fetch_error');

            // Restore
            global.window = originalWindow;
        });
    });

    describe('getEventById', () => {
        it('returns single event by ID', async () => {
            const mockData = {
                id: '123',
                title: 'Test Event',
                slug: 'test-event',
                description: 'A test event',
                start_date: '2025-06-01',
                end_date: '2025-06-03',
                location: 'Convention Center',
                venue_name: null,
                booth_number: null,
                convention_url: null,
                image_url: null,
                is_published: true,
                created_at: '2025-01-01',
                updated_at: '2025-01-01',
            };
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                single: mockSingle,
            });

            const result = await getEventById('123');

            expect(mockSupabase.from).toHaveBeenCalledWith('events');
            expect(mockEq).toHaveBeenCalledWith('id', '123');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('returns error when event not found', async () => {
            const mockError = { code: 'PGRST116', message: 'Not found' };
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                single: mockSingle,
            });

            const result = await getEventById('999');

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });
    });

    describe('createEvent', () => {
        it('creates new event with valid data', async () => {
            const newEvent: EventInput = {
                title: 'New Event',
                slug: 'new-event',
                description: 'A new event',
                start_date: '2025-06-01',
                end_date: '2025-06-03',
                location: 'Convention Center',
                is_published: false,
            };
            const mockData = { id: '123', ...newEvent };
            const mockInsert = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                insert: mockInsert,
            });
            mockInsert.mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await createEvent(newEvent);

            expect(mockSupabase.from).toHaveBeenCalledWith('events');
            expect(mockInsert).toHaveBeenCalledWith(newEvent);
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('returns error on creation failure', async () => {
            const mockError = { code: '23505', message: 'Duplicate slug' };
            const mockInsert = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                insert: mockInsert,
            });
            mockInsert.mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await createEvent({
                title: 'Test',
                slug: 'test',
                start_date: '2025-06-01',
                end_date: '2025-06-03',
                location: 'Test',
            });

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });
    });

    describe('updateEvent', () => {
        it('updates existing event with partial data', async () => {
            const updates = {
                title: 'Updated Title',
                location: 'New Location',
            };
            const mockData = {
                id: '123',
                ...updates,
                slug: 'test',
                start_date: '2025-06-01',
                end_date: '2025-06-03',
            };
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                update: mockUpdate,
            });
            mockUpdate.mockReturnValue({
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await updateEvent('123', updates);

            expect(mockSupabase.from).toHaveBeenCalledWith('events');
            expect(mockUpdate).toHaveBeenCalledWith(updates);
            expect(mockEq).toHaveBeenCalledWith('id', '123');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('returns error on update failure', async () => {
            const mockError = { code: '404', message: 'Not found' };
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                update: mockUpdate,
            });
            mockUpdate.mockReturnValue({
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await updateEvent('999', { title: 'New' });

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });
    });

    describe('deleteEvent', () => {
        it('deletes event by ID', async () => {
            const mockDelete = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: { id: '123' },
                error: null,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                delete: mockDelete,
            });
            mockDelete.mockReturnValue({
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await deleteEvent('123');

            expect(mockSupabase.from).toHaveBeenCalledWith('events');
            expect(mockEq).toHaveBeenCalledWith('id', '123');
            expect(result.data).toEqual({ id: '123' });
            expect(result.error).toBeNull();
        });

        it('returns error on deletion failure', async () => {
            const mockError = { code: '404', message: 'Not found' };
            const mockDelete = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
            });

            (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
                delete: mockDelete,
            });
            mockDelete.mockReturnValue({
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                select: mockSelect,
            });
            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await deleteEvent('999');

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });
    });
});

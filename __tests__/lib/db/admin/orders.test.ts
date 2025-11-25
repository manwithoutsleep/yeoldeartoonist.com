// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    addOrderNote,
    addTrackingNumber,
    type OrderStatus,
} from '@/lib/db/admin/orders';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createServiceRoleClient: vi.fn(),
}));

describe('Admin Order Queries', () => {
    const mockSupabase = {
        from: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof createServiceRoleClient>>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createServiceRoleClient).mockResolvedValue(mockSupabase);
    });

    describe('getAllOrders', () => {
        it('returns all orders paginated', async () => {
            const mockData = [
                {
                    id: '1',
                    order_number: 'ORD-001',
                    customer_name: 'John Doe',
                    status: 'pending' as OrderStatus,
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

            const result = await getAllOrders();

            expect(createServiceRoleClient).toHaveBeenCalled();
            expect(mockSupabase.from).toHaveBeenCalledWith('orders');
            expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('handles pagination correctly', async () => {
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

            await getAllOrders(10, 20);

            expect(mockRange).toHaveBeenCalledWith(20, 29);
        });

        it('filters by status', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
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
                eq: mockEq,
            });
            mockEq.mockReturnValue({
                range: mockRange,
            });
            mockRange.mockReturnValue({
                order: mockOrder,
            });

            await getAllOrders(20, 0, { status: 'paid' });

            expect(mockEq).toHaveBeenCalledWith('status', 'paid');
        });

        it('filters by date range', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockGte = vi.fn().mockReturnThis();
            const mockLte = vi.fn().mockReturnThis();
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
                gte: mockGte,
            });
            mockGte.mockReturnValue({
                lte: mockLte,
            });
            mockLte.mockReturnValue({
                range: mockRange,
            });
            mockRange.mockReturnValue({
                order: mockOrder,
            });

            await getAllOrders(20, 0, {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
            });

            expect(mockGte).toHaveBeenCalledWith('created_at', '2024-01-01');
            expect(mockLte).toHaveBeenCalledWith('created_at', '2024-12-31');
        });

        it('sorts by created_at DESC by default', async () => {
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

            await getAllOrders();

            expect(mockOrder).toHaveBeenCalledWith('created_at', {
                ascending: false,
            });
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

            const result = await getAllOrders();

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });

        it('throws error if called client-side', async () => {
            // Mock window object to simulate client-side
            Object.defineProperty(global, 'window', {
                value: {},
                writable: true,
            });

            await expect(getAllOrders()).rejects.toThrow(
                'Admin queries must run server-side only'
            );

            // Clean up
            Object.defineProperty(global, 'window', {
                value: undefined,
                writable: true,
            });
        });
    });

    describe('getOrderById', () => {
        it('returns order with order_items joined', async () => {
            const mockData = {
                id: '1',
                order_number: 'ORD-001',
                order_items: [
                    {
                        id: 'item-1',
                        artwork_id: 'art-1',
                        quantity: 2,
                        price_at_purchase: '50.00',
                    },
                ],
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

            const result = await getOrderById('1');

            expect(mockSupabase.from).toHaveBeenCalledWith('orders');
            expect(mockSelect).toHaveBeenCalledWith(
                expect.stringContaining('order_items')
            );
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('returns error if order not found', async () => {
            const mockError = {
                code: 'PGRST116',
                message: 'No rows found',
            };
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

            const result = await getOrderById('nonexistent');

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });

        it('throws error if called client-side', async () => {
            Object.defineProperty(global, 'window', {
                value: {},
                writable: true,
            });

            await expect(getOrderById('1')).rejects.toThrow(
                'Admin queries must run server-side only'
            );

            Object.defineProperty(global, 'window', {
                value: undefined,
                writable: true,
            });
        });
    });

    describe('updateOrderStatus', () => {
        it('updates order status successfully', async () => {
            const mockData = {
                id: '1',
                status: 'shipped' as OrderStatus,
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

            const result = await updateOrderStatus('1', 'shipped');

            expect(mockSupabase.from).toHaveBeenCalledWith('orders');
            expect(mockUpdate).toHaveBeenCalledWith({ status: 'shipped' });
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('returns error if order not found', async () => {
            const mockError = {
                code: 'PGRST116',
                message: 'No rows found',
            };
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

            const result = await updateOrderStatus('nonexistent', 'shipped');

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });

        it('throws error if called client-side', async () => {
            Object.defineProperty(global, 'window', {
                value: {},
                writable: true,
            });

            await expect(updateOrderStatus('1', 'shipped')).rejects.toThrow(
                'Admin queries must run server-side only'
            );

            Object.defineProperty(global, 'window', {
                value: undefined,
                writable: true,
            });
        });
    });

    describe('addOrderNote', () => {
        it('appends note to admin_notes field', async () => {
            const existingNotes = '[2024-11-20 10:00] Previous note';
            const mockOrder = {
                id: '1',
                admin_notes: existingNotes,
            };

            // First mock for getting the order
            const mockSelectGet = vi.fn().mockReturnThis();
            const mockEqGet = vi.fn().mockReturnThis();
            const mockSingleGet = vi.fn().mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            // Second mock for updating the order
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEqUpdate = vi.fn().mockReturnThis();
            const mockSelectUpdate = vi.fn().mockReturnThis();
            const mockSingleUpdate = vi.fn().mockResolvedValue({
                data: { ...mockOrder, admin_notes: 'updated notes' },
                error: null,
            });

            let callCount = 0;
            (mockSupabase.from as ReturnType<typeof vi.fn>).mockImplementation(
                () => {
                    callCount++;
                    if (callCount === 1) {
                        return {
                            select: mockSelectGet,
                        };
                    } else {
                        return {
                            update: mockUpdate,
                        };
                    }
                }
            );

            mockSelectGet.mockReturnValue({
                eq: mockEqGet,
            });
            mockEqGet.mockReturnValue({
                single: mockSingleGet,
            });

            mockUpdate.mockReturnValue({
                eq: mockEqUpdate,
            });
            mockEqUpdate.mockReturnValue({
                select: mockSelectUpdate,
            });
            mockSelectUpdate.mockReturnValue({
                single: mockSingleUpdate,
            });

            const result = await addOrderNote('1', 'New note');

            expect(result.error).toBeNull();
            expect(mockUpdate).toHaveBeenCalledWith({
                admin_notes: expect.stringContaining('New note'),
            });
        });

        it('creates new notes if admin_notes is null', async () => {
            const mockOrder = {
                id: '1',
                admin_notes: null,
            };

            const mockSelectGet = vi.fn().mockReturnThis();
            const mockEqGet = vi.fn().mockReturnThis();
            const mockSingleGet = vi.fn().mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const mockUpdate = vi.fn().mockReturnThis();
            const mockEqUpdate = vi.fn().mockReturnThis();
            const mockSelectUpdate = vi.fn().mockReturnThis();
            const mockSingleUpdate = vi.fn().mockResolvedValue({
                data: { ...mockOrder, admin_notes: 'new note' },
                error: null,
            });

            let callCount = 0;
            (mockSupabase.from as ReturnType<typeof vi.fn>).mockImplementation(
                () => {
                    callCount++;
                    if (callCount === 1) {
                        return {
                            select: mockSelectGet,
                        };
                    } else {
                        return {
                            update: mockUpdate,
                        };
                    }
                }
            );

            mockSelectGet.mockReturnValue({
                eq: mockEqGet,
            });
            mockEqGet.mockReturnValue({
                single: mockSingleGet,
            });

            mockUpdate.mockReturnValue({
                eq: mockEqUpdate,
            });
            mockEqUpdate.mockReturnValue({
                select: mockSelectUpdate,
            });
            mockSelectUpdate.mockReturnValue({
                single: mockSingleUpdate,
            });

            const result = await addOrderNote('1', 'First note');

            expect(result.error).toBeNull();
            expect(mockUpdate).toHaveBeenCalledWith({
                admin_notes: expect.stringContaining('First note'),
            });
        });

        it('returns error if order not found', async () => {
            const mockError = {
                code: 'PGRST116',
                message: 'No rows found',
            };
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

            const result = await addOrderNote('nonexistent', 'Note');

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });

        it('throws error if called client-side', async () => {
            Object.defineProperty(global, 'window', {
                value: {},
                writable: true,
            });

            await expect(addOrderNote('1', 'Note')).rejects.toThrow(
                'Admin queries must run server-side only'
            );

            Object.defineProperty(global, 'window', {
                value: undefined,
                writable: true,
            });
        });
    });

    describe('addTrackingNumber', () => {
        it('adds tracking number to order', async () => {
            const mockData = {
                id: '1',
                shipping_tracking_number: 'TRACK123',
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

            const result = await addTrackingNumber('1', 'TRACK123');

            expect(mockSupabase.from).toHaveBeenCalledWith('orders');
            expect(mockUpdate).toHaveBeenCalledWith({
                shipping_tracking_number: 'TRACK123',
            });
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();
        });

        it('returns error if order not found', async () => {
            const mockError = {
                code: 'PGRST116',
                message: 'No rows found',
            };
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

            const result = await addTrackingNumber('nonexistent', 'TRACK123');

            expect(result.data).toBeNull();
            expect(result.error).toEqual({
                code: mockError.code,
                message: mockError.message,
            });
        });

        it('throws error if called client-side', async () => {
            Object.defineProperty(global, 'window', {
                value: {},
                writable: true,
            });

            await expect(addTrackingNumber('1', 'TRACK123')).rejects.toThrow(
                'Admin queries must run server-side only'
            );

            Object.defineProperty(global, 'window', {
                value: undefined,
                writable: true,
            });
        });
    });
});

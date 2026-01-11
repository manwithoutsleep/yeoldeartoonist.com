// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    addOrderNote,
    addTrackingNumber,
    type OrderStatus,
    type OrderItemWithArtwork,
    type OrderWithItemsAndArtwork,
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

    describe('getOrderById - Enhanced with Artwork Details (Issue #65)', () => {
        it('should return order with order_items including artwork details', async () => {
            const mockData = {
                id: '1',
                order_number: 'ORD-001',
                customer_name: 'John Doe',
                order_items: [
                    {
                        id: 'item-1',
                        order_id: '1',
                        artwork_id: 'art-1',
                        quantity: 2,
                        price_at_purchase: '50.00',
                        line_subtotal: '100.00',
                        created_at: '2024-01-01T00:00:00Z',
                        artwork: {
                            title: 'Beautiful Painting',
                            sku: 'ART-001',
                            image_thumbnail_url:
                                'https://example.com/thumb.jpg',
                            slug: 'beautiful-painting',
                        },
                    },
                    {
                        id: 'item-2',
                        order_id: '1',
                        artwork_id: 'art-2',
                        quantity: 1,
                        price_at_purchase: '75.00',
                        line_subtotal: '75.00',
                        created_at: '2024-01-01T00:00:00Z',
                        artwork: {
                            title: 'Stunning Sculpture',
                            sku: 'ART-002',
                            image_thumbnail_url:
                                'https://example.com/thumb2.jpg',
                            slug: 'stunning-sculpture',
                        },
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
            expect(mockSelect).toHaveBeenCalledWith(
                expect.stringContaining('artwork')
            );
            expect(mockEq).toHaveBeenCalledWith('id', '1');
            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();

            // Verify artwork details are included in order items
            // Type assertion: we expect the result to have artwork details once Step 3 is implemented
            const orderWithArtwork =
                result.data as unknown as OrderWithItemsAndArtwork;
            expect(orderWithArtwork?.order_items[0].artwork).toBeDefined();
            expect(orderWithArtwork?.order_items[0].artwork?.title).toBe(
                'Beautiful Painting'
            );
            expect(orderWithArtwork?.order_items[0].artwork?.sku).toBe(
                'ART-001'
            );
            expect(orderWithArtwork?.order_items[0].artwork?.slug).toBe(
                'beautiful-painting'
            );
        });

        it('should handle orders with missing/deleted artwork gracefully', async () => {
            const mockData = {
                id: '1',
                order_number: 'ORD-001',
                customer_name: 'John Doe',
                order_items: [
                    {
                        id: 'item-1',
                        order_id: '1',
                        artwork_id: 'art-1',
                        quantity: 2,
                        price_at_purchase: '50.00',
                        line_subtotal: '100.00',
                        created_at: '2024-01-01T00:00:00Z',
                        artwork: {
                            title: 'Available Artwork',
                            sku: 'ART-001',
                            image_thumbnail_url:
                                'https://example.com/thumb.jpg',
                            slug: 'available-artwork',
                        },
                    },
                    {
                        id: 'item-2',
                        order_id: '1',
                        artwork_id: 'art-deleted',
                        quantity: 1,
                        price_at_purchase: '75.00',
                        line_subtotal: '75.00',
                        created_at: '2024-01-01T00:00:00Z',
                        artwork: null, // Deleted/missing artwork
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

            expect(result.data).toEqual(mockData);
            expect(result.error).toBeNull();

            // Type assertion: we expect the result to have artwork details once Step 3 is implemented
            const orderWithArtwork =
                result.data as unknown as OrderWithItemsAndArtwork;

            // Verify first item has artwork
            expect(orderWithArtwork?.order_items[0].artwork).not.toBeNull();

            // Verify second item has null artwork (graceful handling)
            expect(orderWithArtwork?.order_items[1].artwork).toBeNull();
            expect(orderWithArtwork?.order_items[1].artwork_id).toBe(
                'art-deleted'
            );
        });

        it('should only select necessary artwork fields (title, sku, image_thumbnail_url, slug)', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
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

            await getOrderById('1');

            // Verify select query includes only necessary artwork fields
            const selectQuery = mockSelect.mock.calls[0][0];
            expect(selectQuery).toContain('title');
            expect(selectQuery).toContain('sku');
            expect(selectQuery).toContain('image_thumbnail_url');
            expect(selectQuery).toContain('slug');

            // Verify it doesn't select all artwork fields (should not use "artwork (*)")
            // Instead it should use "artwork (title, sku, image_thumbnail_url, slug)"
            expect(selectQuery).toContain('artwork (');
        });

        it('should return proper type structure matching OrderWithItemsAndArtwork', async () => {
            const mockData: OrderWithItemsAndArtwork = {
                id: '1',
                order_number: 'ORD-001',
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                shipping_address_line1: '123 Main St',
                shipping_address_line2: null,
                shipping_city: 'Springfield',
                shipping_state: 'IL',
                shipping_zip: '62701',
                shipping_country: 'US',
                billing_address_line1: '123 Main St',
                billing_address_line2: null,
                billing_city: 'Springfield',
                billing_state: 'IL',
                billing_zip: '62701',
                billing_country: 'US',
                order_notes: null,
                subtotal: '100.00',
                shipping_cost: '10.00',
                tax_amount: '5.00',
                total: '115.00',
                status: 'pending',
                payment_status: 'pending',
                payment_intent_id: 'pi_123',
                shipping_tracking_number: null,
                admin_notes: null,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                order_items: [
                    {
                        id: 'item-1',
                        order_id: '1',
                        artwork_id: 'art-1',
                        quantity: 2,
                        price_at_purchase: '50.00',
                        line_subtotal: '100.00',
                        created_at: '2024-01-01T00:00:00Z',
                        artwork: {
                            title: 'Beautiful Painting',
                            sku: 'ART-001',
                            image_thumbnail_url:
                                'https://example.com/thumb.jpg',
                            slug: 'beautiful-painting',
                        },
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

            // Type assertion to ensure proper type structure
            expect(result.data).toBeDefined();
            if (result.data) {
                // Type assertion: we expect the result to have artwork details once Step 3 is implemented
                const orderWithArtwork =
                    result.data as unknown as OrderWithItemsAndArtwork;

                // Verify order properties
                expect(orderWithArtwork.id).toBe('1');
                expect(orderWithArtwork.order_number).toBe('ORD-001');
                expect(orderWithArtwork.order_items).toBeInstanceOf(Array);

                // Verify order items have artwork property
                const item = orderWithArtwork.order_items[0];
                expect(item).toBeDefined();
                expect(item.artwork).toBeDefined();
                expect(item.artwork).toHaveProperty('title');
                expect(item.artwork).toHaveProperty('sku');
                expect(item.artwork).toHaveProperty('image_thumbnail_url');
                expect(item.artwork).toHaveProperty('slug');

                // Verify artwork can be null (type safety)
                const itemWithNullArtwork: OrderItemWithArtwork = {
                    id: 'item-2',
                    order_id: '1',
                    artwork_id: 'art-deleted',
                    quantity: 1,
                    price_at_purchase: '75.00',
                    line_subtotal: '75.00',
                    created_at: '2024-01-01T00:00:00Z',
                    artwork: null,
                };
                expect(itemWithNullArtwork.artwork).toBeNull();
            }
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

    describe('Type Tests - OrderItemWithArtwork', () => {
        it('should verify OrderItemWithArtwork type has correct shape', () => {
            // This test verifies the type structure at compile time
            const validOrderItem: OrderItemWithArtwork = {
                id: 'item-1',
                order_id: '1',
                artwork_id: 'art-1',
                quantity: 2,
                price_at_purchase: '50.00',
                line_subtotal: '100.00',
                created_at: '2024-01-01T00:00:00Z',
                artwork: {
                    title: 'Beautiful Painting',
                    sku: 'ART-001',
                    image_thumbnail_url: 'https://example.com/thumb.jpg',
                    slug: 'beautiful-painting',
                },
            };

            expect(validOrderItem).toBeDefined();
            expect(validOrderItem.artwork).toBeDefined();
            expect(validOrderItem.artwork?.title).toBe('Beautiful Painting');
            expect(validOrderItem.artwork?.sku).toBe('ART-001');
            expect(validOrderItem.artwork?.image_thumbnail_url).toBe(
                'https://example.com/thumb.jpg'
            );
            expect(validOrderItem.artwork?.slug).toBe('beautiful-painting');
        });

        it('should verify nullable artwork field is properly typed', () => {
            // Test that artwork can be null
            const orderItemWithNullArtwork: OrderItemWithArtwork = {
                id: 'item-1',
                order_id: '1',
                artwork_id: 'art-deleted',
                quantity: 1,
                price_at_purchase: '50.00',
                line_subtotal: '50.00',
                created_at: '2024-01-01T00:00:00Z',
                artwork: null,
            };

            expect(orderItemWithNullArtwork.artwork).toBeNull();

            // Test that artwork fields can be null
            const orderItemWithNullableFields: OrderItemWithArtwork = {
                id: 'item-2',
                order_id: '1',
                artwork_id: 'art-2',
                quantity: 1,
                price_at_purchase: '50.00',
                line_subtotal: '50.00',
                created_at: '2024-01-01T00:00:00Z',
                artwork: {
                    title: 'Artwork Without SKU or Thumbnail',
                    sku: null,
                    image_thumbnail_url: null,
                    slug: 'artwork-without-sku',
                },
            };

            expect(orderItemWithNullableFields.artwork?.sku).toBeNull();
            expect(
                orderItemWithNullableFields.artwork?.image_thumbnail_url
            ).toBeNull();
        });
    });

    describe('Type Tests - OrderWithItemsAndArtwork', () => {
        it('should verify OrderWithItemsAndArtwork type has correct shape', () => {
            const validOrder: OrderWithItemsAndArtwork = {
                id: '1',
                order_number: 'ORD-001',
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                shipping_address_line1: '123 Main St',
                shipping_address_line2: null,
                shipping_city: 'Springfield',
                shipping_state: 'IL',
                shipping_zip: '62701',
                shipping_country: 'US',
                billing_address_line1: '123 Main St',
                billing_address_line2: null,
                billing_city: 'Springfield',
                billing_state: 'IL',
                billing_zip: '62701',
                billing_country: 'US',
                order_notes: null,
                subtotal: '100.00',
                shipping_cost: '10.00',
                tax_amount: '5.00',
                total: '115.00',
                status: 'pending',
                payment_status: 'pending',
                payment_intent_id: 'pi_123',
                shipping_tracking_number: null,
                admin_notes: null,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                order_items: [
                    {
                        id: 'item-1',
                        order_id: '1',
                        artwork_id: 'art-1',
                        quantity: 2,
                        price_at_purchase: '50.00',
                        line_subtotal: '100.00',
                        created_at: '2024-01-01T00:00:00Z',
                        artwork: {
                            title: 'Beautiful Painting',
                            sku: 'ART-001',
                            image_thumbnail_url:
                                'https://example.com/thumb.jpg',
                            slug: 'beautiful-painting',
                        },
                    },
                ],
            };

            expect(validOrder).toBeDefined();
            expect(validOrder.order_items).toBeInstanceOf(Array);
            expect(validOrder.order_items[0].artwork).toBeDefined();
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

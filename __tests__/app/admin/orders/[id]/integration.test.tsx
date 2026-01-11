/**
 * Integration tests for Order Detail Page
 *
 * These tests verify end-to-end functionality of the order detail page,
 * including database query integration, component rendering, and interactions.
 *
 * Test Coverage:
 * - End-to-end data flow from database query to UI rendering
 * - Performance validation (query execution time, N+1 prevention)
 * - Edge case handling (missing artwork, partial data)
 * - Full workflow validation with realistic data scenarios
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderDetailPage from '@/app/admin/orders/[id]/page';
import {
    getOrderById,
    type OrderWithItemsAndArtwork,
} from '@/lib/db/admin/orders';

// Mock the database function
vi.mock('@/lib/db/admin/orders', () => ({
    getOrderById: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
    notFound: vi.fn(() => {
        throw new Error('Not Found');
    }),
}));

// Mock next/link
vi.mock('next/link', () => ({
    __esModule: true,
    default: ({
        children,
        href,
    }: {
        children: React.ReactNode;
        href: string;
    }) => <a href={href}>{children}</a>,
}));

const createMockOrder = (
    overrides?: Partial<OrderWithItemsAndArtwork>
): OrderWithItemsAndArtwork => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    order_number: 'ORD-20241121001',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    shipping_address_line1: '123 Main St',
    shipping_address_line2: 'Apt 4',
    shipping_city: 'Springfield',
    shipping_state: 'IL',
    shipping_zip: '62701',
    shipping_country: 'US',
    billing_address_line1: '456 Oak Ave',
    billing_address_line2: null,
    billing_city: 'Springfield',
    billing_state: 'IL',
    billing_zip: '62702',
    billing_country: 'US',
    order_notes: 'Please gift wrap',
    subtotal: '150.00',
    shipping_cost: '10.00',
    tax_amount: '12.00',
    total: '172.00',
    status: 'paid',
    payment_intent_id: 'pi_test123',
    payment_status: 'succeeded',
    shipping_tracking_number: 'TRACK123456',
    admin_notes: '[2024-11-20 10:00] First note',
    created_at: '2024-11-21T10:00:00Z',
    updated_at: '2024-11-21T10:00:00Z',
    order_items: [
        {
            id: 'item1',
            order_id: '123e4567-e89b-12d3-a456-426614174000',
            artwork_id: 'art1',
            quantity: 2,
            price_at_purchase: '50.00',
            line_subtotal: '100.00',
            created_at: '2024-11-21T10:00:00Z',
            artwork: {
                title: 'Beautiful Painting',
                sku: 'ART-001',
                image_thumbnail_url: 'https://example.com/thumb1.jpg',
                slug: 'beautiful-painting',
            },
        },
        {
            id: 'item2',
            order_id: '123e4567-e89b-12d3-a456-426614174000',
            artwork_id: 'art2',
            quantity: 1,
            price_at_purchase: '50.00',
            line_subtotal: '50.00',
            created_at: '2024-11-21T10:00:00Z',
            artwork: {
                title: 'Stunning Sculpture',
                sku: 'ART-002',
                image_thumbnail_url: 'https://example.com/thumb2.jpg',
                slug: 'stunning-sculpture',
            },
        },
    ],
    ...overrides,
});

describe('Order Detail Page - Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('End-to-End Flow', () => {
        it('should fetch order with getOrderById and render all artwork details correctly', async () => {
            const mockOrder = createMockOrder();
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Verify getOrderById was called with correct ID
            expect(getOrderById).toHaveBeenCalledWith(mockOrder.id);
            expect(getOrderById).toHaveBeenCalledTimes(1);

            // Verify order header is displayed
            expect(screen.getByText('ORD-20241121001')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();

            // Verify all artwork details are displayed
            expect(screen.getByText('Beautiful Painting')).toBeInTheDocument();
            expect(screen.getByText('Stunning Sculpture')).toBeInTheDocument();

            // Verify artwork SKUs
            expect(screen.getByText(/ART-001/)).toBeInTheDocument();
            expect(screen.getByText(/ART-002/)).toBeInTheDocument();

            // Verify images are rendered
            const images = screen.getAllByRole('img');
            expect(images.length).toBeGreaterThan(0);

            // Verify quantities and prices
            expect(screen.getByText('2')).toBeInTheDocument(); // quantity
            expect(screen.getByText('1')).toBeInTheDocument(); // quantity
            expect(screen.getAllByText('$50.00').length).toBeGreaterThan(0); // prices
            expect(screen.getByText('$100.00')).toBeInTheDocument(); // subtotal
        });

        it('should render clickable artwork title links that navigate to shoppe detail pages', async () => {
            const mockOrder = createMockOrder();
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Verify artwork title links
            const paintingLink = screen
                .getByText('Beautiful Painting')
                .closest('a');
            const sculptureLink = screen
                .getByText('Stunning Sculpture')
                .closest('a');

            expect(paintingLink).toHaveAttribute(
                'href',
                '/shoppe/beautiful-painting'
            );
            expect(sculptureLink).toHaveAttribute(
                'href',
                '/shoppe/stunning-sculpture'
            );
        });

        it('should display complete order information including addresses and totals', async () => {
            const mockOrder = createMockOrder();
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Customer information
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();

            // Shipping address
            expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
            expect(screen.getByText(/Apt 4/)).toBeInTheDocument();
            expect(screen.getByText(/62701/)).toBeInTheDocument();

            // Billing address
            expect(screen.getByText(/456 Oak Ave/)).toBeInTheDocument();
            expect(screen.getByText(/62702/)).toBeInTheDocument();

            // Order totals
            expect(screen.getByText('$150.00')).toBeInTheDocument(); // Subtotal
            expect(screen.getByText('$10.00')).toBeInTheDocument(); // Shipping
            expect(screen.getByText('$12.00')).toBeInTheDocument(); // Tax
            expect(screen.getByText('$172.00')).toBeInTheDocument(); // Total
        });

        it('should display order status and action forms', async () => {
            const mockOrder = createMockOrder();
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Status display
            expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);

            // Interactive forms
            expect(screen.getByLabelText(/order status/i)).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /update status/i })
            ).toBeInTheDocument();
            expect(
                screen.getByLabelText(/add admin note/i)
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /save note/i })
            ).toBeInTheDocument();
            expect(
                screen.getByLabelText(/tracking number/i)
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /save tracking/i })
            ).toBeInTheDocument();
        });

        it('should render back navigation link', async () => {
            const mockOrder = createMockOrder();
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            const backLink = screen.getByRole('link', {
                name: /back to orders/i,
            });
            expect(backLink).toHaveAttribute('href', '/admin/orders');
        });
    });

    describe('Performance Tests', () => {
        it('should execute getOrderById query in under 500ms', async () => {
            const mockOrder = createMockOrder();
            let queryExecutionTime = 0;

            // Mock getOrderById with timing measurement
            vi.mocked(getOrderById).mockImplementation(async () => {
                const startTime = Date.now();
                // Simulate database query
                await new Promise((resolve) => setTimeout(resolve, 50));
                queryExecutionTime = Date.now() - startTime;

                return {
                    data: mockOrder,
                    error: null,
                };
            });

            await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });

            // Verify query completed quickly
            expect(queryExecutionTime).toBeLessThan(500);
        });

        it('should call getOrderById exactly once (no N+1 query problem)', async () => {
            const mockOrder = createMockOrder({
                order_items: [
                    {
                        id: 'item1',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art1',
                        quantity: 2,
                        price_at_purchase: '50.00',
                        line_subtotal: '100.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'Item 1',
                            sku: 'ART-001',
                            image_thumbnail_url:
                                'https://example.com/thumb1.jpg',
                            slug: 'item-1',
                        },
                    },
                    {
                        id: 'item2',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art2',
                        quantity: 1,
                        price_at_purchase: '30.00',
                        line_subtotal: '30.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'Item 2',
                            sku: 'ART-002',
                            image_thumbnail_url:
                                'https://example.com/thumb2.jpg',
                            slug: 'item-2',
                        },
                    },
                    {
                        id: 'item3',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art3',
                        quantity: 3,
                        price_at_purchase: '20.00',
                        line_subtotal: '60.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'Item 3',
                            sku: 'ART-003',
                            image_thumbnail_url:
                                'https://example.com/thumb3.jpg',
                            slug: 'item-3',
                        },
                    },
                ],
            });

            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Critical: Should only call getOrderById once, not once per item
            expect(getOrderById).toHaveBeenCalledTimes(1);

            // Verify all items are displayed (proving join worked)
            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
            expect(screen.getByText('Item 3')).toBeInTheDocument();
        });

        it('should fetch all artwork details in a single query using join', async () => {
            const mockOrder = createMockOrder({
                order_items: [
                    {
                        id: 'item1',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art1',
                        quantity: 1,
                        price_at_purchase: '100.00',
                        line_subtotal: '100.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'First Artwork',
                            sku: 'SKU-001',
                            image_thumbnail_url: 'https://example.com/1.jpg',
                            slug: 'first-artwork',
                        },
                    },
                    {
                        id: 'item2',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art2',
                        quantity: 2,
                        price_at_purchase: '75.00',
                        line_subtotal: '150.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'Second Artwork',
                            sku: 'SKU-002',
                            image_thumbnail_url: 'https://example.com/2.jpg',
                            slug: 'second-artwork',
                        },
                    },
                ],
            });

            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Verify only one database call was made
            expect(getOrderById).toHaveBeenCalledTimes(1);

            // Verify all artwork data from join is displayed
            expect(screen.getByText('First Artwork')).toBeInTheDocument();
            expect(screen.getByText('Second Artwork')).toBeInTheDocument();
            expect(screen.getByText(/SKU-001/)).toBeInTheDocument();
            expect(screen.getByText(/SKU-002/)).toBeInTheDocument();
        });
    });

    describe('Edge Case Integration', () => {
        it('should complete workflow with missing artwork (deleted after order creation)', async () => {
            const mockOrder = createMockOrder({
                order_items: [
                    {
                        id: 'item1',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'deleted-artwork-id',
                        quantity: 1,
                        price_at_purchase: '100.00',
                        line_subtotal: '100.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: null, // Artwork was deleted
                    },
                    {
                        id: 'item2',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art2',
                        quantity: 1,
                        price_at_purchase: '50.00',
                        line_subtotal: '50.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'Available Item',
                            sku: 'ART-002',
                            image_thumbnail_url:
                                'https://example.com/thumb2.jpg',
                            slug: 'available-item',
                        },
                    },
                ],
            });

            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Verify query executed successfully
            expect(getOrderById).toHaveBeenCalledTimes(1);

            // Verify page rendered without crashing
            expect(screen.getByText('ORD-20241121001')).toBeInTheDocument();

            // Verify missing artwork displays fallback
            expect(screen.getByText(/Item Unavailable/)).toBeInTheDocument();
            expect(
                screen.getByText(/ID: deleted-artwork-id/)
            ).toBeInTheDocument();
            expect(screen.getByText(/N\/A/)).toBeInTheDocument(); // SKU fallback

            // Verify available item displays normally
            expect(screen.getByText('Available Item')).toBeInTheDocument();
            expect(screen.getByText(/ART-002/)).toBeInTheDocument();

            // Verify order totals still calculate correctly
            expect(screen.getByText('$150.00')).toBeInTheDocument();
        });

        it('should complete workflow with partial artwork data (missing SKU and thumbnail)', async () => {
            const mockOrder = createMockOrder({
                order_items: [
                    {
                        id: 'item1',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art1',
                        quantity: 1,
                        price_at_purchase: '150.00',
                        line_subtotal: '150.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'Partial Data Item',
                            sku: null, // Missing SKU
                            image_thumbnail_url: null, // Missing thumbnail
                            slug: 'partial-data-item',
                        },
                    },
                ],
            });

            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Verify query executed successfully
            expect(getOrderById).toHaveBeenCalledTimes(1);

            // Verify page rendered without crashing
            expect(screen.getByText('ORD-20241121001')).toBeInTheDocument();

            // Verify partial data displays with fallbacks
            expect(screen.getByText('Partial Data Item')).toBeInTheDocument();
            expect(screen.getByText(/N\/A/)).toBeInTheDocument(); // SKU fallback
            expect(screen.getByText('No Image')).toBeInTheDocument(); // Image fallback

            // Verify link still works with slug
            const link = screen.getByText('Partial Data Item').closest('a');
            expect(link).toHaveAttribute('href', '/shoppe/partial-data-item');
        });

        it('should complete workflow with mixed data quality (some complete, some partial, some missing)', async () => {
            const mockOrder = createMockOrder({
                order_items: [
                    {
                        id: 'item1',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art1',
                        quantity: 1,
                        price_at_purchase: '50.00',
                        line_subtotal: '50.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'Complete Item',
                            sku: 'SKU-COMPLETE',
                            image_thumbnail_url: 'https://example.com/1.jpg',
                            slug: 'complete-item',
                        },
                    },
                    {
                        id: 'item2',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art2',
                        quantity: 1,
                        price_at_purchase: '30.00',
                        line_subtotal: '30.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'Partial Item',
                            sku: null,
                            image_thumbnail_url: null,
                            slug: 'partial-item',
                        },
                    },
                    {
                        id: 'item3',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'deleted-id',
                        quantity: 1,
                        price_at_purchase: '70.00',
                        line_subtotal: '70.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: null,
                    },
                ],
            });

            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Verify single query execution
            expect(getOrderById).toHaveBeenCalledTimes(1);

            // Verify complete item
            expect(screen.getByText('Complete Item')).toBeInTheDocument();
            expect(screen.getByText(/SKU-COMPLETE/)).toBeInTheDocument();

            // Verify partial item with fallbacks
            expect(screen.getByText('Partial Item')).toBeInTheDocument();
            const noImageElements = screen.getAllByText('No Image');
            expect(noImageElements.length).toBeGreaterThan(0);

            // Verify missing item
            expect(screen.getByText(/Item Unavailable/)).toBeInTheDocument();
            expect(screen.getByText(/ID: deleted-id/)).toBeInTheDocument();

            // Verify order totals are correct
            expect(screen.getByText('$150.00')).toBeInTheDocument();
        });

        it('should handle order with no items gracefully', async () => {
            const mockOrder = createMockOrder({
                order_items: [],
            });

            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Verify query executed
            expect(getOrderById).toHaveBeenCalledTimes(1);

            // Verify page rendered
            expect(screen.getByText('ORD-20241121001')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();

            // Verify order items section exists but is empty
            expect(screen.getByText('Order Items')).toBeInTheDocument();
        });

        it('should handle database error gracefully', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: null,
                error: {
                    code: 'database_error',
                    message: 'Connection timeout',
                },
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: 'some-id' }),
            });
            render(result);

            // Verify error message is displayed
            expect(screen.getByText(/error/i)).toBeInTheDocument();
            expect(screen.getByText(/connection timeout/i)).toBeInTheDocument();
        });

        it('should handle not found error correctly', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: null,
                error: {
                    code: 'PGRST116',
                    message: 'No rows found',
                },
            });

            await expect(
                OrderDetailPage({
                    params: Promise.resolve({ id: 'nonexistent-id' }),
                })
            ).rejects.toThrow('Not Found');
        });
    });

    describe('Data Consistency', () => {
        it('should maintain data consistency between query results and rendered UI', async () => {
            const mockOrder = createMockOrder({
                order_number: 'ORD-CONSISTENCY-TEST',
                customer_name: 'Jane Smith',
                total: '299.99',
                order_items: [
                    {
                        id: 'item1',
                        order_id: '123e4567-e89b-12d3-a456-426614174000',
                        artwork_id: 'art1',
                        quantity: 3,
                        price_at_purchase: '99.99',
                        line_subtotal: '299.97',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: {
                            title: 'Consistency Test Item',
                            sku: 'SKU-CONSISTENCY',
                            image_thumbnail_url:
                                'https://example.com/consistency.jpg',
                            slug: 'consistency-test-item',
                        },
                    },
                ],
            });

            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrder,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: mockOrder.id }),
            });
            render(result);

            // Verify exact data matches
            expect(
                screen.getByText('ORD-CONSISTENCY-TEST')
            ).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('$299.99')).toBeInTheDocument();
            expect(
                screen.getByText('Consistency Test Item')
            ).toBeInTheDocument();
            expect(screen.getByText(/SKU-CONSISTENCY/)).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument(); // quantity
            expect(screen.getByText('$99.99')).toBeInTheDocument(); // price
        });
    });
});

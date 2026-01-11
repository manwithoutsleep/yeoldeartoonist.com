/**
 * Tests for Order Detail Page
 *
 * Tests the /admin/orders/[id] page which displays:
 * - Complete order information (customer, addresses, order items)
 * - Status update form
 * - Admin notes form
 * - Tracking number form
 * - Back link to orders list
 * - 404 handling for non-existent orders
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
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
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

const mockOrderWithItems: OrderWithItemsAndArtwork = {
    id: '123',
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
            order_id: '123',
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
            order_id: '123',
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
};

describe('OrderDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Order Display', () => {
        it('should fetch and display order details', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(getOrderById).toHaveBeenCalledWith('123');
            expect(screen.getByText('ORD-20241121001')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('should display artwork title for each order item', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText('Beautiful Painting')).toBeInTheDocument();
            expect(screen.getByText('Stunning Sculpture')).toBeInTheDocument();
        });

        it('should display artwork SKU for each order item', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText(/ART-001/)).toBeInTheDocument();
            expect(screen.getByText(/ART-002/)).toBeInTheDocument();
        });

        it('should display N/A when SKU is missing', async () => {
            const orderWithMissingSku: OrderWithItemsAndArtwork = {
                ...mockOrderWithItems,
                order_items: [
                    {
                        ...mockOrderWithItems.order_items[0],
                        artwork: {
                            title: 'No SKU Item',
                            sku: null,
                            image_thumbnail_url:
                                'https://example.com/thumb.jpg',
                            slug: 'no-sku-item',
                        },
                    },
                ],
            };

            vi.mocked(getOrderById).mockResolvedValue({
                data: orderWithMissingSku,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText(/N\/A/)).toBeInTheDocument();
        });

        it('should display artwork thumbnail for each order item', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            const images = screen.getAllByRole('img');
            const thumbnail1 = images.find(
                (img) =>
                    img.getAttribute('src') === 'https://example.com/thumb1.jpg'
            );
            const thumbnail2 = images.find(
                (img) =>
                    img.getAttribute('src') === 'https://example.com/thumb2.jpg'
            );

            expect(thumbnail1).toBeInTheDocument();
            expect(thumbnail2).toBeInTheDocument();
        });

        it('should display placeholder when thumbnail is missing', async () => {
            const orderWithMissingThumbnail: OrderWithItemsAndArtwork = {
                ...mockOrderWithItems,
                order_items: [
                    {
                        ...mockOrderWithItems.order_items[0],
                        artwork: {
                            title: 'No Thumbnail Item',
                            sku: 'ART-003',
                            image_thumbnail_url: null,
                            slug: 'no-thumbnail-item',
                        },
                    },
                ],
            };

            vi.mocked(getOrderById).mockResolvedValue({
                data: orderWithMissingThumbnail,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText('No Image')).toBeInTheDocument();
        });

        it('should link artwork title to shoppe detail page', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            const link1 = screen.getByText('Beautiful Painting').closest('a');
            const link2 = screen.getByText('Stunning Sculpture').closest('a');

            expect(link1).toHaveAttribute('href', '/shoppe/beautiful-painting');
            expect(link2).toHaveAttribute('href', '/shoppe/stunning-sculpture');
        });

        it('should display Item Unavailable when artwork is null', async () => {
            const orderWithDeletedArtwork: OrderWithItemsAndArtwork = {
                ...mockOrderWithItems,
                order_items: [
                    {
                        id: 'item1',
                        order_id: '123',
                        artwork_id: 'deleted-art-id',
                        quantity: 1,
                        price_at_purchase: '50.00',
                        line_subtotal: '50.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: null,
                    },
                ],
            };

            vi.mocked(getOrderById).mockResolvedValue({
                data: orderWithDeletedArtwork,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText(/Item Unavailable/)).toBeInTheDocument();
            expect(screen.getByText(/ID: deleted-art-id/)).toBeInTheDocument();
        });

        it('should not display database ID for available items', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            // Ensure artwork IDs are not shown in the UI
            expect(screen.queryByText('art1')).not.toBeInTheDocument();
            expect(screen.queryByText('art2')).not.toBeInTheDocument();
            expect(screen.queryByText(/ID: art/)).not.toBeInTheDocument();
        });

        it('should display customer information', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('should display shipping address', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
            expect(screen.getByText(/Apt 4/)).toBeInTheDocument();
            expect(screen.getAllByText(/Springfield/).length).toBeGreaterThan(
                0
            );
            expect(screen.getAllByText(/IL/).length).toBeGreaterThan(0);
            expect(screen.getByText(/62701/)).toBeInTheDocument();
        });

        it('should display billing address', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText(/456 Oak Ave/)).toBeInTheDocument();
            expect(screen.getByText(/62702/)).toBeInTheDocument();
        });

        it('should display order status badge', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            // Status appears both as badge and in dropdown
            expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);
        });

        it('should display order items', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            // Check quantities and prices are displayed (may appear multiple times)
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getAllByText('$50.00').length).toBeGreaterThan(0);
            expect(screen.getByText('$100.00')).toBeInTheDocument();
        });

        it('should display order totals', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText('$150.00')).toBeInTheDocument(); // Subtotal
            expect(screen.getByText('$10.00')).toBeInTheDocument(); // Shipping
            expect(screen.getByText('$12.00')).toBeInTheDocument(); // Tax
            expect(screen.getByText('$172.00')).toBeInTheDocument(); // Total
        });

        it('should display customer notes if present', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText(/Please gift wrap/)).toBeInTheDocument();
        });

        it('should display admin notes if present', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText(/First note/)).toBeInTheDocument();
        });

        it('should display tracking number if present', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByDisplayValue('TRACK123456')).toBeInTheDocument();
        });
    });

    describe('Status Update', () => {
        it('should render status dropdown with current status selected', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            const statusSelect = screen.getByLabelText(/order status/i);
            expect(statusSelect).toHaveValue('paid');
        });

        it('should have all status options in dropdown', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(
                screen.getByRole('option', { name: /pending/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /^paid$/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /processing/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /shipped/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /delivered/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /cancelled/i })
            ).toBeInTheDocument();
        });

        it('should render Update Status button', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(
                screen.getByRole('button', { name: /update status/i })
            ).toBeInTheDocument();
        });
    });

    describe('Admin Notes', () => {
        it('should render admin notes textarea', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(
                screen.getByLabelText(/add admin note/i)
            ).toBeInTheDocument();
        });

        it('should render Save Notes button', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(
                screen.getByRole('button', { name: /save note/i })
            ).toBeInTheDocument();
        });
    });

    describe('Tracking Number', () => {
        it('should render tracking number input', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(
                screen.getByLabelText(/tracking number/i)
            ).toBeInTheDocument();
        });

        it('should render Save Tracking button', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(
                screen.getByRole('button', { name: /save tracking/i })
            ).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should render back link to orders list', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            const backLink = screen.getByRole('link', {
                name: /back to orders/i,
            });
            expect(backLink).toHaveAttribute('href', '/admin/orders');
        });
    });

    describe('Error Handling', () => {
        it('should call notFound when order not found', async () => {
            const { notFound } = await import('next/navigation');

            vi.mocked(getOrderById).mockResolvedValue({
                data: null,
                error: {
                    code: 'PGRST116',
                    message: 'No rows found',
                },
            });

            await expect(
                OrderDetailPage({
                    params: Promise.resolve({ id: 'nonexistent' }),
                })
            ).rejects.toThrow('Not Found');

            expect(notFound).toHaveBeenCalled();
        });

        it('should display error message on fetch error', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: null,
                error: {
                    code: 'fetch_error',
                    message: 'Database error',
                },
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText(/error/i)).toBeInTheDocument();
            expect(screen.getByText(/database error/i)).toBeInTheDocument();
        });
    });

    describe('Date Formatting', () => {
        it('should format order date correctly', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            // Check that date is displayed (format may vary)
            expect(screen.getByText(/Nov 21, 2024/i)).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle order with all items having complete artwork data', async () => {
            vi.mocked(getOrderById).mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            // All artwork data should be displayed
            expect(screen.getByText('Beautiful Painting')).toBeInTheDocument();
            expect(screen.getByText('Stunning Sculpture')).toBeInTheDocument();
            expect(screen.getByText(/ART-001/)).toBeInTheDocument();
            expect(screen.getByText(/ART-002/)).toBeInTheDocument();

            const images = screen.getAllByRole('img');
            expect(images.length).toBeGreaterThan(0);
        });

        it('should handle order with some items missing artwork (deleted)', async () => {
            const orderWithMixedItems: OrderWithItemsAndArtwork = {
                ...mockOrderWithItems,
                order_items: [
                    {
                        ...mockOrderWithItems.order_items[0],
                        artwork: {
                            title: 'Available Item',
                            sku: 'ART-001',
                            image_thumbnail_url:
                                'https://example.com/thumb.jpg',
                            slug: 'available-item',
                        },
                    },
                    {
                        id: 'item2',
                        order_id: '123',
                        artwork_id: 'deleted-art-id',
                        quantity: 1,
                        price_at_purchase: '50.00',
                        line_subtotal: '50.00',
                        created_at: '2024-11-21T10:00:00Z',
                        artwork: null,
                    },
                ],
            };

            vi.mocked(getOrderById).mockResolvedValue({
                data: orderWithMixedItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            // Available item should show normally
            expect(screen.getByText('Available Item')).toBeInTheDocument();
            expect(screen.getByText(/ART-001/)).toBeInTheDocument();

            // Deleted item should show unavailable message
            expect(screen.getByText(/Item Unavailable/)).toBeInTheDocument();
            expect(screen.getByText(/ID: deleted-art-id/)).toBeInTheDocument();
        });

        it('should handle order with items missing SKU', async () => {
            const orderWithMissingSku: OrderWithItemsAndArtwork = {
                ...mockOrderWithItems,
                order_items: [
                    {
                        ...mockOrderWithItems.order_items[0],
                        artwork: {
                            title: 'Item Without SKU',
                            sku: null,
                            image_thumbnail_url:
                                'https://example.com/thumb.jpg',
                            slug: 'item-without-sku',
                        },
                    },
                ],
            };

            vi.mocked(getOrderById).mockResolvedValue({
                data: orderWithMissingSku,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(screen.getByText('Item Without SKU')).toBeInTheDocument();
            expect(screen.getByText(/N\/A/)).toBeInTheDocument();
        });

        it('should handle order with items missing thumbnail', async () => {
            const orderWithMissingThumbnail: OrderWithItemsAndArtwork = {
                ...mockOrderWithItems,
                order_items: [
                    {
                        ...mockOrderWithItems.order_items[0],
                        artwork: {
                            title: 'Item Without Thumbnail',
                            sku: 'ART-003',
                            image_thumbnail_url: null,
                            slug: 'item-without-thumbnail',
                        },
                    },
                ],
            };

            vi.mocked(getOrderById).mockResolvedValue({
                data: orderWithMissingThumbnail,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            expect(
                screen.getByText('Item Without Thumbnail')
            ).toBeInTheDocument();
            expect(screen.getByText(/ART-003/)).toBeInTheDocument();
            expect(screen.getByText('No Image')).toBeInTheDocument();
        });

        it('should handle order with no items', async () => {
            const orderWithNoItems: OrderWithItemsAndArtwork = {
                ...mockOrderWithItems,
                order_items: [],
            };

            vi.mocked(getOrderById).mockResolvedValue({
                data: orderWithNoItems,
                error: null,
            });

            const result = await OrderDetailPage({
                params: Promise.resolve({ id: '123' }),
            });
            render(result);

            // Should still display order header and totals
            expect(screen.getByText('ORD-20241121001')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();

            // Order items table should be present but empty
            expect(screen.getByText('Order Items')).toBeInTheDocument();
        });
    });
});

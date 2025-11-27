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
import { getOrderById, type OrderWithItems } from '@/lib/db/admin/orders';

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

const mockOrderWithItems: OrderWithItems = {
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
        },
        {
            id: 'item2',
            order_id: '123',
            artwork_id: 'art2',
            quantity: 1,
            price_at_purchase: '50.00',
            line_subtotal: '50.00',
            created_at: '2024-11-21T10:00:00Z',
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
});

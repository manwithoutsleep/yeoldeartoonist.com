/**
 * Tests for OrdersList Component
 *
 * The OrdersList component displays orders in a table format with:
 * - Order number, customer name, date, total, and status
 * - Color-coded status badges
 * - View Details button for each order
 * - Pagination controls when there are multiple pages
 * - Empty state when no orders exist
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import OrdersList from '@/components/admin/OrdersList';
import type { OrderRow } from '@/lib/db/admin/orders';

// Sample orders data for testing
const mockOrders: OrderRow[] = [
    {
        id: '1',
        order_number: 'ORD-001',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        shipping_address_line1: '123 Main St',
        shipping_address_line2: null,
        shipping_city: 'City',
        shipping_state: 'ST',
        shipping_zip: '12345',
        shipping_country: 'US',
        billing_address_line1: '123 Main St',
        billing_address_line2: null,
        billing_city: 'City',
        billing_state: 'ST',
        billing_zip: '12345',
        billing_country: 'US',
        order_notes: null,
        subtotal: '100.00',
        shipping_cost: '10.00',
        tax_amount: '8.00',
        total: '118.00',
        status: 'pending',
        payment_intent_id: null,
        payment_status: 'pending',
        shipping_tracking_number: null,
        admin_notes: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
    },
    {
        id: '2',
        order_number: 'ORD-002',
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        shipping_address_line1: '456 Oak Ave',
        shipping_address_line2: 'Apt 2',
        shipping_city: 'Town',
        shipping_state: 'CA',
        shipping_zip: '67890',
        shipping_country: 'US',
        billing_address_line1: '456 Oak Ave',
        billing_address_line2: 'Apt 2',
        billing_city: 'Town',
        billing_state: 'CA',
        billing_zip: '67890',
        billing_country: 'US',
        order_notes: 'Please handle with care',
        subtotal: '250.00',
        shipping_cost: '15.00',
        tax_amount: '20.00',
        total: '285.00',
        status: 'shipped',
        payment_intent_id: 'pi_test123',
        payment_status: 'succeeded',
        shipping_tracking_number: 'TRACK123',
        admin_notes: 'Priority order',
        created_at: '2024-01-02T14:30:00Z',
        updated_at: '2024-01-02T15:00:00Z',
    },
];

describe('OrdersList Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Core Rendering', () => {
        it('should render orders list with table structure', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
        });

        it('should render all column headers', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            expect(screen.getByText('Order Number')).toBeInTheDocument();
            expect(screen.getByText('Customer')).toBeInTheDocument();
            expect(screen.getByText('Date')).toBeInTheDocument();
            expect(screen.getByText('Total')).toBeInTheDocument();
            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Actions')).toBeInTheDocument();
        });

        it('should display order data for all orders', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            expect(screen.getByText('ORD-001')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('$118.00')).toBeInTheDocument();

            expect(screen.getByText('ORD-002')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('$285.00')).toBeInTheDocument();
        });

        it('should show empty state when no orders', () => {
            render(
                <OrdersList
                    orders={[]}
                    currentPage={1}
                    totalPages={0}
                    onPageChange={vi.fn()}
                />
            );

            expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('Status Badges', () => {
        it('should display status badge with correct text', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            expect(screen.getByText('Pending')).toBeInTheDocument();
            expect(screen.getByText('Shipped')).toBeInTheDocument();
        });

        it('should apply correct color classes for pending status', () => {
            render(
                <OrdersList
                    orders={[mockOrders[0]]}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            const badge = screen.getByText('Pending');
            expect(badge).toHaveClass('bg-yellow-100');
            expect(badge).toHaveClass('text-yellow-800');
        });

        it('should apply correct color classes for shipped status', () => {
            render(
                <OrdersList
                    orders={[mockOrders[1]]}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            const badge = screen.getByText('Shipped');
            expect(badge).toHaveClass('bg-blue-100');
            expect(badge).toHaveClass('text-blue-800');
        });

        it('should handle all status types with correct colors', () => {
            const statusOrders: OrderRow[] = [
                { ...mockOrders[0], id: '1', status: 'pending' },
                { ...mockOrders[0], id: '2', status: 'paid' },
                { ...mockOrders[0], id: '3', status: 'processing' },
                { ...mockOrders[0], id: '4', status: 'shipped' },
                { ...mockOrders[0], id: '5', status: 'delivered' },
                { ...mockOrders[0], id: '6', status: 'cancelled' },
            ];

            render(
                <OrdersList
                    orders={statusOrders}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            const pendingBadge = screen.getByText('Pending');
            expect(pendingBadge).toHaveClass(
                'bg-yellow-100',
                'text-yellow-800'
            );

            const paidBadge = screen.getByText('Paid');
            expect(paidBadge).toHaveClass('bg-green-100', 'text-green-800');

            const processingBadge = screen.getByText('Processing');
            expect(processingBadge).toHaveClass('bg-blue-100', 'text-blue-800');

            const shippedBadge = screen.getByText('Shipped');
            expect(shippedBadge).toHaveClass('bg-blue-100', 'text-blue-800');

            const deliveredBadge = screen.getByText('Delivered');
            expect(deliveredBadge).toHaveClass('bg-teal-100', 'text-teal-800');

            const cancelledBadge = screen.getByText('Cancelled');
            expect(cancelledBadge).toHaveClass('bg-red-100', 'text-red-800');
        });
    });

    describe('View Details Links', () => {
        it('should render View Details button for each order', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            const detailsLinks = screen.getAllByText('View Details');
            expect(detailsLinks).toHaveLength(2);
        });

        it('should link to correct order detail page', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            const detailsLinks = screen.getAllByRole('link', {
                name: /view details/i,
            });
            expect(detailsLinks[0]).toHaveAttribute('href', '/admin/orders/1');
            expect(detailsLinks[1]).toHaveAttribute('href', '/admin/orders/2');
        });
    });

    describe('Pagination', () => {
        it('should show pagination when totalPages > 1', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={3}
                    onPageChange={vi.fn()}
                />
            );

            const prevButtons = screen.getAllByText('Previous');
            const nextButtons = screen.getAllByText('Next');
            expect(prevButtons.length).toBeGreaterThan(0);
            expect(nextButtons.length).toBeGreaterThan(0);
            expect(screen.getByText(/Page/)).toBeInTheDocument();
            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
        });

        it('should not show pagination when totalPages <= 1', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            expect(screen.queryByText('Previous')).not.toBeInTheDocument();
            expect(screen.queryByText('Next')).not.toBeInTheDocument();
        });

        it('should disable Previous button on first page', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={3}
                    onPageChange={vi.fn()}
                />
            );

            const prevButtons = screen.getAllByText('Previous');
            prevButtons.forEach((button) => {
                expect(button).toHaveAttribute('disabled');
            });
        });

        it('should disable Next button on last page', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={3}
                    totalPages={3}
                    onPageChange={vi.fn()}
                />
            );

            const nextButtons = screen.getAllByText('Next');
            nextButtons.forEach((button) => {
                expect(button).toHaveAttribute('disabled');
            });
        });

        it('should call onPageChange with correct page when Previous clicked', async () => {
            const user = userEvent.setup();
            const onPageChange = vi.fn();

            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={2}
                    totalPages={3}
                    onPageChange={onPageChange}
                />
            );

            const prevButtons = screen.getAllByText('Previous');
            await user.click(prevButtons[0]);

            expect(onPageChange).toHaveBeenCalledWith(1);
        });

        it('should call onPageChange with correct page when Next clicked', async () => {
            const user = userEvent.setup();
            const onPageChange = vi.fn();

            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={3}
                    onPageChange={onPageChange}
                />
            );

            const nextButtons = screen.getAllByText('Next');
            await user.click(nextButtons[0]);

            expect(onPageChange).toHaveBeenCalledWith(2);
        });
    });

    describe('Date Formatting', () => {
        it('should format dates correctly', () => {
            render(
                <OrdersList
                    orders={mockOrders}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={vi.fn()}
                />
            );

            // Check that dates are displayed (format may vary)
            expect(screen.getByText(/Jan 1, 2024/i)).toBeInTheDocument();
            expect(screen.getByText(/Jan 2, 2024/i)).toBeInTheDocument();
        });
    });
});

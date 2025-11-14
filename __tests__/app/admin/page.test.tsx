/**
 * Tests for Admin Dashboard Page
 *
 * The admin dashboard is a server component that:
 * - Displays dashboard metrics (total orders, revenue, pending orders)
 * - Shows recent orders in a table
 * - Provides quick navigation to admin sections
 * - Handles errors gracefully
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminPage from '@/app/admin/page';
import { getDashboardMetrics, getRecentOrders } from '@/lib/db/admin/dashboard';

// Mock the database functions
vi.mock('@/lib/db/admin/dashboard', () => ({
    getDashboardMetrics: vi.fn(),
    getRecentOrders: vi.fn(),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
    default: ({
        children,
        href,
    }: {
        children: React.ReactNode;
        href: string;
    }) => <a href={href}>{children}</a>,
}));

const mockGetDashboardMetrics = vi.mocked(getDashboardMetrics);
const mockGetRecentOrders = vi.mocked(getRecentOrders);

describe('Admin Dashboard Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Metrics Display', () => {
        it('should display dashboard metrics successfully', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 42,
                    orders_this_month: 15,
                    total_revenue: 1250.5,
                    pending_orders: 5,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Total Orders')).toBeInTheDocument();
            expect(screen.getByText('42')).toBeInTheDocument();
            expect(screen.getByText('Orders This Month')).toBeInTheDocument();
            expect(screen.getByText('15')).toBeInTheDocument();
            expect(screen.getByText('Total Revenue')).toBeInTheDocument();
            expect(screen.getByText('$1250.50')).toBeInTheDocument();
            expect(screen.getByText('Pending Orders')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should display zero values when no metrics are available', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: null,
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            expect(screen.getByText('Total Orders')).toBeInTheDocument();
            const zeros = screen.getAllByText('0');
            expect(zeros.length).toBeGreaterThan(0);
            expect(screen.getByText('$0.00')).toBeInTheDocument();
        });

        it('should display metrics error message', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: null,
                error: {
                    message: 'Failed to load metrics',
                    code: 'METRICS_ERROR',
                },
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            expect(screen.getByText('Error')).toBeInTheDocument();
            expect(
                screen.getByText('Failed to load metrics')
            ).toBeInTheDocument();
        });
    });

    describe('Recent Orders Display', () => {
        it('should display recent orders in a table', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 500,
                    pending_orders: 2,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [
                    {
                        id: '1',
                        order_number: 'ORD-001',
                        customer_name: 'John Doe',
                        customer_email: 'john@example.com',
                        total: '99.99',
                        status: 'pending',
                        created_at: '2024-01-15T10:00:00Z',
                    },
                    {
                        id: '2',
                        order_number: 'ORD-002',
                        customer_name: 'Jane Smith',
                        customer_email: 'jane@example.com',
                        total: '149.99',
                        status: 'paid',
                        created_at: '2024-01-16T11:00:00Z',
                    },
                ],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            expect(screen.getByText('Recent Orders')).toBeInTheDocument();
            expect(screen.getByText('ORD-001')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('$99.99')).toBeInTheDocument();
            expect(screen.getByText('pending')).toBeInTheDocument();

            expect(screen.getByText('ORD-002')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('$149.99')).toBeInTheDocument();
            expect(screen.getByText('paid')).toBeInTheDocument();
        });

        it('should display empty state when no orders exist', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 0,
                    orders_this_month: 0,
                    total_revenue: 0,
                    pending_orders: 0,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            expect(screen.getByText('Recent Orders')).toBeInTheDocument();
            expect(
                screen.getByText(
                    /No orders yet\. Create your first order from the shop!/
                )
            ).toBeInTheDocument();
        });

        it('should display orders error message', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 500,
                    pending_orders: 2,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [],
                error: {
                    message: 'Failed to load orders',
                    code: 'ORDERS_ERROR',
                },
            });

            const page = await AdminPage();
            render(page);

            const errorMessages = screen.getAllByText('Error');
            expect(errorMessages.length).toBeGreaterThan(0);
            expect(
                screen.getByText('Failed to load orders')
            ).toBeInTheDocument();
        });

        it('should display different order statuses with correct styling', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 500,
                    pending_orders: 2,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [
                    {
                        id: '1',
                        order_number: 'ORD-001',
                        customer_name: 'John Doe',
                        customer_email: 'john@example.com',
                        total: '99.99',
                        status: 'pending',
                        created_at: '2024-01-15T10:00:00Z',
                    },
                    {
                        id: '2',
                        order_number: 'ORD-002',
                        customer_name: 'Jane Smith',
                        customer_email: 'jane@example.com',
                        total: '149.99',
                        status: 'paid',
                        created_at: '2024-01-16T11:00:00Z',
                    },
                    {
                        id: '3',
                        order_number: 'ORD-003',
                        customer_name: 'Bob Johnson',
                        customer_email: 'bob@example.com',
                        total: '199.99',
                        status: 'shipped',
                        created_at: '2024-01-17T12:00:00Z',
                    },
                    {
                        id: '4',
                        order_number: 'ORD-004',
                        customer_name: 'Alice Williams',
                        customer_email: 'alice@example.com',
                        total: '249.99',
                        status: 'delivered',
                        created_at: '2024-01-18T13:00:00Z',
                    },
                ],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            const pendingStatus = screen.getByText('pending');
            expect(pendingStatus).toHaveClass('bg-yellow-500');

            const paidStatus = screen.getByText('paid');
            expect(paidStatus).toHaveClass('bg-green-500');

            const shippedStatus = screen.getByText('shipped');
            expect(shippedStatus).toHaveClass('bg-blue-500');

            const deliveredStatus = screen.getByText('delivered');
            expect(deliveredStatus).toHaveClass('bg-green-700');
        });
    });

    describe('Navigation Links', () => {
        it('should have a link to view all orders', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 500,
                    pending_orders: 2,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            const viewAllLink = screen.getByText('View All →');
            expect(viewAllLink).toBeInTheDocument();
            expect(viewAllLink).toHaveAttribute('href', '/admin/orders');
        });

        it('should have view links for each order', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 500,
                    pending_orders: 2,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [
                    {
                        id: 'order-123',
                        order_number: 'ORD-001',
                        customer_name: 'John Doe',
                        customer_email: 'john@example.com',
                        total: '99.99',
                        status: 'pending',
                        created_at: '2024-01-15T10:00:00Z',
                    },
                ],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            const viewLinks = screen.getAllByText('View');
            expect(viewLinks.length).toBeGreaterThan(0);
            expect(viewLinks[0]).toHaveAttribute(
                'href',
                '/admin/orders/order-123'
            );
        });
    });

    describe('Page Layout', () => {
        it('should display page title and description', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 500,
                    pending_orders: 2,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(
                screen.getByText('Welcome to your admin dashboard')
            ).toBeInTheDocument();
        });

        it('should display metrics in a grid layout', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 42,
                    orders_this_month: 15,
                    total_revenue: 1250.5,
                    pending_orders: 5,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [],
                error: null,
            });

            const page = await AdminPage();
            const { container } = render(page);

            const grid = container.querySelector('.grid');
            expect(grid).toBeInTheDocument();
            expect(grid).toHaveClass(
                'grid-cols-1',
                'md:grid-cols-2',
                'lg:grid-cols-4'
            );
        });
    });

    describe('Data Formatting', () => {
        it('should format currency values correctly', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 1234.567,
                    pending_orders: 2,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [
                    {
                        id: '1',
                        order_number: 'ORD-001',
                        customer_name: 'John Doe',
                        customer_email: 'john@example.com',
                        total: '123.456',
                        status: 'pending',
                        created_at: '2024-01-15T10:00:00Z',
                    },
                ],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            expect(screen.getByText('$1234.57')).toBeInTheDocument();
            expect(screen.getByText('$123.46')).toBeInTheDocument();
        });

        it('should format dates correctly', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 500,
                    pending_orders: 2,
                },
                error: null,
            });

            const testDate = '2024-01-15T10:30:00Z';
            mockGetRecentOrders.mockResolvedValue({
                data: [
                    {
                        id: '1',
                        order_number: 'ORD-001',
                        customer_name: 'John Doe',
                        customer_email: 'john@example.com',
                        total: '99.99',
                        status: 'pending',
                        created_at: testDate,
                    },
                ],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            const expectedDate = new Date(testDate).toLocaleDateString();
            expect(screen.getByText(expectedDate)).toBeInTheDocument();
        });
    });

    describe('Table Structure', () => {
        it('should display correct table headers', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 500,
                    pending_orders: 2,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [
                    {
                        id: '1',
                        order_number: 'ORD-001',
                        customer_name: 'John Doe',
                        customer_email: 'john@example.com',
                        total: '99.99',
                        status: 'pending',
                        created_at: '2024-01-15T10:00:00Z',
                    },
                ],
                error: null,
            });

            const page = await AdminPage();
            render(page);

            expect(screen.getByText('Order Number')).toBeInTheDocument();
            expect(screen.getByText('Customer')).toBeInTheDocument();
            expect(screen.getByText('Total')).toBeInTheDocument();
            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Date')).toBeInTheDocument();
            expect(screen.getByText('Action')).toBeInTheDocument();
        });

        it('should display order data in correct table structure', async () => {
            mockGetDashboardMetrics.mockResolvedValue({
                data: {
                    total_orders: 10,
                    orders_this_month: 5,
                    total_revenue: 500,
                    pending_orders: 2,
                },
                error: null,
            });

            mockGetRecentOrders.mockResolvedValue({
                data: [
                    {
                        id: '1',
                        order_number: 'ORD-001',
                        customer_name: 'John Doe',
                        customer_email: 'john@example.com',
                        total: '99.99',
                        status: 'pending',
                        created_at: '2024-01-15T10:00:00Z',
                    },
                ],
                error: null,
            });

            const page = await AdminPage();
            const { container } = render(page);

            const table = container.querySelector('table');
            expect(table).toBeInTheDocument();

            const thead = table?.querySelector('thead');
            expect(thead).toBeInTheDocument();

            const tbody = table?.querySelector('tbody');
            expect(tbody).toBeInTheDocument();

            const rows = tbody?.querySelectorAll('tr');
            expect(rows?.length).toBe(1);
        });
    });
});

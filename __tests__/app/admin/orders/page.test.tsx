/**
 * Tests for Orders List Page
 *
 * Tests the /admin/orders page which displays all orders with:
 * - Orders list with pagination
 * - Status filter dropdown
 * - Loading and error states
 * - Integration with OrdersList component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import OrdersPage from '@/app/admin/orders/page';
import type { OrderRow } from '@/lib/db/admin/orders';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useSearchParams: () => mockSearchParams,
}));

// Mock the OrdersList component
vi.mock('@/components/admin/OrdersList', () => ({
    default: ({
        orders,
        currentPage,
        totalPages,
        onPageChange,
    }: {
        orders: OrderRow[];
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    }) => (
        <div data-testid="orders-list">
            <div>Orders: {orders.length}</div>
            <div>Page: {currentPage}</div>
            <div>Total Pages: {totalPages}</div>
            <button onClick={() => onPageChange(currentPage + 1)}>
                Next Page
            </button>
        </div>
    ),
}));

// Mock fetch
global.fetch = vi.fn();

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

describe('OrdersPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams.delete('page');
        mockSearchParams.delete('status');
    });

    describe('Initial Render', () => {
        it('should render page title', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: mockOrders.length,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /orders/i })
                ).toBeInTheDocument();
            });
        });

        it('should render status filter dropdown', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: mockOrders.length,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(
                    screen.getByLabelText(/filter by status/i)
                ).toBeInTheDocument();
            });
        });

        it('should show loading state initially', () => {
            vi.mocked(fetch).mockImplementationOnce(
                () =>
                    new Promise(() => {
                        /* never resolves */
                    })
            );

            render(<OrdersPage />);

            expect(screen.getByText(/loading orders/i)).toBeInTheDocument();
        });
    });

    describe('Data Fetching', () => {
        it('should fetch orders on mount', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: mockOrders.length,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/api/admin/orders')
                );
            });
        });

        it('should display fetched orders', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: mockOrders.length,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(screen.getByText('Orders: 2')).toBeInTheDocument();
            });
        });

        it('should handle fetch errors', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                json: async () => ({}),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(screen.getByText(/error/i)).toBeInTheDocument();
            });
        });

        it('should handle network errors', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            render(<OrdersPage />);

            await waitFor(() => {
                expect(screen.getByText(/error/i)).toBeInTheDocument();
            });
        });
    });

    describe('Pagination', () => {
        it('should fetch with correct page parameter', async () => {
            mockSearchParams.set('page', '2');

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: 50,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    expect.stringContaining('offset=20')
                );
            });
        });

        it('should display correct page number', async () => {
            mockSearchParams.set('page', '2');

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: 50,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(screen.getByText('Page: 2')).toBeInTheDocument();
            });
        });

        it('should calculate total pages correctly', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: 50,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(screen.getByText('Total Pages: 3')).toBeInTheDocument();
            });
        });

        it('should handle page change', async () => {
            const user = userEvent.setup();

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: 50,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(screen.getByTestId('orders-list')).toBeInTheDocument();
            });

            const nextButton = screen.getByText('Next Page');
            await user.click(nextButton);

            expect(mockPush).toHaveBeenCalledWith(
                expect.stringContaining('page=2')
            );
        });
    });

    describe('Status Filter', () => {
        it('should have all status options', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: mockOrders.length,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(
                    screen.getByLabelText(/filter by status/i)
                ).toBeInTheDocument();
            });

            const select = screen.getByLabelText(/filter by status/i);
            expect(select).toBeInTheDocument();

            // Check that status options exist
            expect(
                screen.getByRole('option', { name: /all orders/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /^pending$/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /^paid$/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('option', { name: /^shipped$/i })
            ).toBeInTheDocument();
        });

        it('should fetch with status filter when selected', async () => {
            const user = userEvent.setup();

            vi.mocked(fetch)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        orders: mockOrders,
                        total: mockOrders.length,
                    }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        orders: [mockOrders[0]],
                        total: 1,
                    }),
                } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(
                    screen.getByLabelText(/filter by status/i)
                ).toBeInTheDocument();
            });

            const select = screen.getByLabelText(/filter by status/i);
            await user.selectOptions(select, 'paid');

            expect(mockPush).toHaveBeenCalledWith(
                expect.stringContaining('status=paid')
            );
        });

        it('should reset to page 1 when filter changes', async () => {
            const user = userEvent.setup();

            mockSearchParams.set('page', '2');

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: mockOrders,
                    total: 50,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(
                    screen.getByLabelText(/filter by status/i)
                ).toBeInTheDocument();
            });

            const select = screen.getByLabelText(/filter by status/i);
            await user.selectOptions(select, 'paid');

            expect(mockPush).toHaveBeenCalledWith(
                expect.stringContaining('page=1')
            );
        });

        it('should fetch filtered orders from API', async () => {
            mockSearchParams.set('status', 'paid');

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: [mockOrders[0]],
                    total: 1,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    expect.stringContaining('status=paid')
                );
            });
        });
    });

    describe('Empty State', () => {
        it('should render orders list even with empty data', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    orders: [],
                    total: 0,
                }),
            } as Response);

            render(<OrdersPage />);

            await waitFor(() => {
                expect(screen.getByTestId('orders-list')).toBeInTheDocument();
            });

            // Component renders even with empty data
            expect(screen.getByTestId('orders-list')).toBeInTheDocument();
            expect(screen.getByText('Total Pages: 1')).toBeInTheDocument();
        });
    });
});

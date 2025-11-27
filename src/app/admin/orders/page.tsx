'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import OrdersList from '@/components/admin/OrdersList';
import type { OrderRow, OrderStatus } from '@/lib/db/admin/orders';

const ITEMS_PER_PAGE = 20;

export default function OrdersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);

    const currentPage = parseInt(searchParams.get('page') || '1');
    const statusFilter = (searchParams.get('status') || '') as OrderStatus | '';

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true);
            setError(null);

            try {
                const offset = (currentPage - 1) * ITEMS_PER_PAGE;
                const queryParams = new URLSearchParams({
                    limit: ITEMS_PER_PAGE.toString(),
                    offset: offset.toString(),
                });

                if (statusFilter) {
                    queryParams.append('status', statusFilter);
                }

                const response = await fetch(
                    `/api/admin/orders?${queryParams.toString()}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data.orders || []);
                setTotalPages(
                    Math.ceil((data.total || 0) / ITEMS_PER_PAGE) || 1
                );
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load orders'
                );
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [currentPage, statusFilter]);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`/admin/orders?${params.toString()}`);
    };

    const handleStatusFilterChange = (status: string) => {
        const params = new URLSearchParams();
        params.set('page', '1');
        if (status) {
            params.set('status', status);
        }
        router.push(`/admin/orders?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="mb-6 text-3xl font-bold text-gray-900">
                    Orders
                </h1>
                <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                    Loading orders...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <h1 className="mb-6 text-3xl font-bold text-gray-900">
                    Orders
                </h1>
                <div className="p-8 text-center text-red-600 bg-white rounded-lg border border-red-200">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            </div>

            <div className="mb-4">
                <label htmlFor="status-filter" className="admin-label">
                    Filter by Status
                </label>
                <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="admin-input"
                >
                    <option value="">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <OrdersList
                orders={orders}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

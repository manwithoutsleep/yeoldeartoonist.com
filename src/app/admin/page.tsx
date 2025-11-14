/**
 * Admin Dashboard Page (Server Component)
 *
 * Main dashboard showing:
 * - Key metrics (total orders, revenue, pending orders, etc.)
 * - Recent orders list
 * - Quick access to content management
 *
 * Uses layout.tsx for header/navigation structure
 */

import Link from 'next/link';
import { AdminCard } from '@/components/admin/AdminCard';
import { getDashboardMetrics, getRecentOrders } from '@/lib/db/admin/dashboard';

export default async function AdminPage() {
    // Fetch data server-side
    const metricsResult = await getDashboardMetrics();
    const ordersResult = await getRecentOrders(10);

    const metrics = metricsResult.data;
    const metricsError = metricsResult.error;
    const recentOrders = ordersResult.data || [];
    const ordersError = ordersResult.error;

    return (
        <div className="space-y-8">
            {/* Page Title */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome to your admin dashboard
                </p>
            </div>

            {/* Metrics Error */}
            {metricsError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-700 font-semibold">Error</p>
                    <p className="text-red-600 text-sm">
                        {metricsError.message}
                    </p>
                </div>
            )}

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminCard
                    title="Total Orders"
                    value={metrics?.total_orders ?? 0}
                />
                <AdminCard
                    title="Orders This Month"
                    value={metrics?.orders_this_month ?? 0}
                />
                <AdminCard
                    title="Total Revenue"
                    value={
                        metrics
                            ? `$${metrics.total_revenue.toFixed(2)}`
                            : '$0.00'
                    }
                />
                <AdminCard
                    title="Pending Orders"
                    value={metrics?.pending_orders ?? 0}
                />
            </div>

            {/* Recent Orders Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Recent Orders
                    </h2>
                    <Link
                        href="/admin/orders"
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        View All →
                    </Link>
                </div>

                {ordersError && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-red-700 font-semibold">Error</p>
                        <p className="text-red-600 text-sm">
                            {ordersError.message}
                        </p>
                    </div>
                )}

                {recentOrders.length === 0 ? (
                    <div className="bg-white border-2 border-black rounded p-6 text-center">
                        <p className="text-gray-600">
                            No orders yet. Create your first order from the
                            shop!
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border-2 border-black rounded overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-black bg-gray-50">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Order Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm font-mono text-gray-900">
                                            {order.order_number}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {order.customer_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            $
                                            {parseFloat(order.total).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`inline-block px-3 py-1 rounded text-white text-xs font-semibold ${
                                                    order.status === 'pending'
                                                        ? 'bg-yellow-500'
                                                        : order.status ===
                                                            'paid'
                                                          ? 'bg-green-500'
                                                          : order.status ===
                                                              'shipped'
                                                            ? 'bg-blue-500'
                                                            : order.status ===
                                                                'delivered'
                                                              ? 'bg-green-700'
                                                              : 'bg-red-500'
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(
                                                order.created_at
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-semibold"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

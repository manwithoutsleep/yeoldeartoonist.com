import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrderById } from '@/lib/db/admin/orders';
import OrderDetailClient from './OrderDetailClient';
import { OrderItemRow } from './OrderItemRow';

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { data: order, error } = await getOrderById(id);

    // Handle not found (specific Postgres error code for no rows)
    if (!order && error?.code === 'PGRST116') {
        notFound();
    }

    // Handle other errors (but not "no rows" which is handled above)
    if (error && error.code !== 'PGRST116') {
        return (
            <div className="p-6">
                <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                    Error: {error.message}
                </div>
            </div>
        );
    }

    // If no order and no error, also treat as not found
    if (!order) {
        notFound();
    }

    return (
        <div className="p-6">
            {/* Header with back link */}
            <div className="mb-6">
                <Link
                    href="/admin/orders"
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    ← Back to Orders
                </Link>
            </div>

            {/* Order header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {order.order_number}
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                        {new Date(order.created_at).toLocaleDateString(
                            'en-US',
                            {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            }
                        )}
                    </span>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'shipped'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : order.status === 'delivered'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Customer Information
                        </h2>
                        <div className="space-y-2">
                            <div>
                                <span className="text-gray-600">Name:</span>{' '}
                                <span className="text-gray-900">
                                    {order.customer_name}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Email:</span>{' '}
                                <span className="text-gray-900">
                                    {order.customer_email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Shipping Address
                        </h2>
                        <div className="text-gray-900">
                            <div>{order.shipping_address_line1}</div>
                            {order.shipping_address_line2 && (
                                <div>{order.shipping_address_line2}</div>
                            )}
                            <div>
                                {order.shipping_city}, {order.shipping_state}{' '}
                                {order.shipping_zip}
                            </div>
                            <div>{order.shipping_country}</div>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Billing Address
                        </h2>
                        <div className="text-gray-900">
                            <div>{order.billing_address_line1}</div>
                            {order.billing_address_line2 && (
                                <div>{order.billing_address_line2}</div>
                            )}
                            <div>
                                {order.billing_city}, {order.billing_state}{' '}
                                {order.billing_zip}
                            </div>
                            <div>{order.billing_country}</div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Order Items
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Image
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Item
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            SKU
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.order_items.map((item) => (
                                        <OrderItemRow
                                            key={item.id}
                                            item={item}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="mt-6 border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-900">
                                <span>Subtotal:</span>
                                <span>
                                    ${parseFloat(order.subtotal).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-900">
                                <span>Shipping:</span>
                                <span>
                                    $
                                    {parseFloat(order.shipping_cost).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-900">
                                <span>Tax:</span>
                                <span>
                                    ${parseFloat(order.tax_amount).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total:</span>
                                <span>
                                    ${parseFloat(order.total).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Notes */}
                    {order.order_notes && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Customer Notes
                            </h2>
                            <p className="text-gray-700">{order.order_notes}</p>
                        </div>
                    )}

                    {/* Admin Notes Display */}
                    {order.admin_notes && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Admin Notes History
                            </h2>
                            <div className="text-gray-700 whitespace-pre-wrap">
                                {order.admin_notes}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    <OrderDetailClient order={order} />
                </div>
            </div>
        </div>
    );
}

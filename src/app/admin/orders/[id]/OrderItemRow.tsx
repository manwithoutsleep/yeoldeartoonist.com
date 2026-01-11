import Link from 'next/link';
import Image from 'next/image';
import type { OrderItemWithArtwork } from '@/lib/db/admin/orders';

interface OrderItemRowProps {
    item: OrderItemWithArtwork;
}

export function OrderItemRow({ item }: OrderItemRowProps) {
    return (
        <tr>
            {/* Image column */}
            <td className="px-4 py-4">
                {item.artwork?.image_thumbnail_url ? (
                    <Image
                        src={item.artwork.image_thumbnail_url}
                        alt={item.artwork.title}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                    />
                ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No Image
                    </div>
                )}
            </td>

            {/* Title column */}
            <td className="px-4 py-4">
                {item.artwork ? (
                    <Link
                        href={`/shoppe/${item.artwork.slug}`}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        {item.artwork.title}
                    </Link>
                ) : (
                    <span className="text-red-600">
                        Item Unavailable (ID: {item.artwork_id})
                    </span>
                )}
            </td>

            {/* SKU column */}
            <td className="px-4 py-4 text-gray-900">
                {item.artwork?.sku || 'N/A'}
            </td>

            {/* Quantity column */}
            <td className="px-4 py-4 text-right text-gray-900">
                {item.quantity}
            </td>

            {/* Price column */}
            <td className="px-4 py-4 text-right text-gray-900">
                ${parseFloat(item.price_at_purchase).toFixed(2)}
            </td>

            {/* Subtotal column */}
            <td className="px-4 py-4 text-right text-gray-900">
                ${parseFloat(item.line_subtotal).toFixed(2)}
            </td>
        </tr>
    );
}

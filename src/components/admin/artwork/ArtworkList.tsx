import Link from 'next/link';
import Image from 'next/image';
import type { ArtworkRow } from '@/lib/db/admin/artwork';

interface ArtworkListProps {
    artwork: ArtworkRow[];
}

export default function ArtworkList({ artwork }: ArtworkListProps) {
    if (!artwork || artwork.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                <p>
                    No artwork found. Create your first artwork to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Image
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Title
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Price
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Status
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {artwork.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="relative w-12 h-12">
                                    {item.image_thumbnail_url ? (
                                        <Image
                                            src={item.image_thumbnail_url}
                                            alt={item.title}
                                            fill
                                            className="object-cover rounded"
                                            sizes="48px"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded text-gray-400 text-xs">
                                            No Img
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {item.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {item.slug}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    ${parseFloat(item.price).toFixed(2)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                        item.is_published
                                            ? 'text-green-800 bg-green-100'
                                            : 'text-yellow-800 bg-yellow-100'
                                    }`}
                                >
                                    {item.is_published ? 'Published' : 'Draft'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                <Link
                                    href={`/admin/artwork/${item.id}/edit`}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    Edit
                                </Link>
                                <button
                                    type="button"
                                    className="text-red-600 hover:text-red-900"
                                    aria-label={`Delete ${item.title}`}
                                    onClick={() => {
                                        // TODO: Implement delete confirmation
                                        if (
                                            confirm(
                                                'Are you sure you want to delete this artwork?'
                                            )
                                        ) {
                                            // Call delete action (passed via props or context later)
                                            console.log('Delete', item.id);
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

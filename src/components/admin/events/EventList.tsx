'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { EventRow } from '@/lib/db/admin/events';
import { deleteEventAction } from '@/app/admin/events/actions';
import { useState } from 'react';

interface EventListProps {
    events: EventRow[];
}

export default function EventList({ events }: EventListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) {
            return;
        }

        setDeletingId(id);
        try {
            await deleteEventAction(id);
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete event'
            );
            setDeletingId(null);
        }
    };

    if (!events || events.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                <p>No events found. Create your first event to get started.</p>
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
                            Dates
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                            Location
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
                    {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="relative w-12 h-12">
                                    {event.image_url ? (
                                        <Image
                                            src={event.image_url}
                                            alt={event.title}
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
                                    {event.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {event.slug}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {new Date(
                                        event.start_date
                                    ).toLocaleDateString()}{' '}
                                    -{' '}
                                    {new Date(
                                        event.end_date
                                    ).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                    {event.location}
                                </div>
                                {event.venue_name && (
                                    <div className="text-sm text-gray-500">
                                        {event.venue_name}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                        event.is_published
                                            ? 'text-green-800 bg-green-100'
                                            : 'text-yellow-800 bg-yellow-100'
                                    }`}
                                >
                                    {event.is_published ? 'Published' : 'Draft'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                <Link
                                    href={`/admin/events/${event.id}/edit`}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    Edit
                                </Link>
                                <button
                                    type="button"
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                    aria-label={`Delete ${event.title}`}
                                    disabled={deletingId === event.id}
                                    onClick={() =>
                                        handleDelete(event.id, event.title)
                                    }
                                >
                                    {deletingId === event.id
                                        ? 'Deleting...'
                                        : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

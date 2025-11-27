import Link from 'next/link';
import { getAllEventsAdmin } from '@/lib/db/admin/events';
import EventList from '@/components/admin/events/EventList';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
    const { data: events, error } = await getAllEventsAdmin();

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                Error: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Events Management
                </h1>
                <Link
                    href="/admin/events/new"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add New Event
                </Link>
            </div>

            <EventList events={events || []} />
        </div>
    );
}

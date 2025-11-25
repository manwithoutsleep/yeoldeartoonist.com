import EventForm from '@/components/admin/EventForm';
import { createEventAction } from '@/app/admin/events/actions';
import Link from 'next/link';

export default function NewEventPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Create New Event
                </h1>
                <Link
                    href="/admin/events"
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    Back to Events
                </Link>
            </div>

            <EventForm onSubmit={createEventAction} />
        </div>
    );
}

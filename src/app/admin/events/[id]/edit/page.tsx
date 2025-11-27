import EventForm from '@/components/admin/EventForm';
import { getEventById } from '@/lib/db/admin/events';
import { updateEventAction } from '@/app/admin/events/actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditEventPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
    const { id } = await params;
    const { data: event, error } = await getEventById(id);

    if (error || !event) {
        notFound();
    }

    // Bind the id to the action using .bind()
    const boundUpdateAction = updateEventAction.bind(null, id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
                <Link
                    href="/admin/events"
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    Back to Events
                </Link>
            </div>

            <EventForm initialData={event} onSubmit={boundUpdateAction} />
        </div>
    );
}

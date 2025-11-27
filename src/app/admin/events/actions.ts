'use server';

import { createEvent, deleteEvent, updateEvent } from '@/lib/db/admin/events';
import { type EventFormData } from '@/lib/validation/events';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createEventAction(data: EventFormData) {
    const { error } = await createEvent(data);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');
    redirect('/admin/events');
}

export async function updateEventAction(id: string, data: EventFormData) {
    const { error } = await updateEvent(id, data);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/events');
    revalidatePath(`/admin/events/${id}`);
    revalidatePath('/events');
    redirect('/admin/events');
}

export async function deleteEventAction(id: string) {
    const { error } = await deleteEvent(id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');
}

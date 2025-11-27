'use server';

import {
    updateOrderStatus,
    addOrderNote,
    addTrackingNumber,
    type OrderStatus,
} from '@/lib/db/admin/orders';
import { revalidatePath } from 'next/cache';

export async function updateStatusAction(orderId: string, status: OrderStatus) {
    const result = await updateOrderStatus(orderId, status);

    if (result.error) {
        throw new Error(result.error.message);
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath('/admin'); // Dashboard metrics

    return result;
}

export async function addNoteAction(orderId: string, note: string) {
    const result = await addOrderNote(orderId, note);

    if (result.error) {
        throw new Error(result.error.message);
    }

    revalidatePath(`/admin/orders/${orderId}`);

    return result;
}

export async function addTrackingAction(orderId: string, tracking: string) {
    const result = await addTrackingNumber(orderId, tracking);

    if (result.error) {
        throw new Error(result.error.message);
    }

    revalidatePath(`/admin/orders/${orderId}`);

    return result;
}

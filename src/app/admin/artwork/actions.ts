'use server';

import {
    createArtwork,
    deleteArtwork,
    updateArtwork,
} from '@/lib/db/admin/artwork';
import { type ArtworkFormData } from '@/lib/validation/artwork';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createArtworkAction(data: ArtworkFormData) {
    const { error } = await createArtwork(data);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/artwork');
    redirect('/admin/artwork');
}

export async function updateArtworkAction(id: string, data: ArtworkFormData) {
    const { error } = await updateArtwork(id, data);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/artwork');
    revalidatePath(`/admin/artwork/${id}`);
    redirect('/admin/artwork');
}

export async function deleteArtworkAction(id: string) {
    const { error } = await deleteArtwork(id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/artwork');
}

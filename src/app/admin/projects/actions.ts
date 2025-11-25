'use server';

import {
    createProject,
    deleteProject,
    updateProject,
} from '@/lib/db/admin/projects';
import { type ProjectFormData } from '@/lib/validation/projects';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProjectAction(data: ProjectFormData) {
    const { error } = await createProject(data);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/projects');
    revalidatePath('/in-the-works');
    redirect('/admin/projects');
}

export async function updateProjectAction(id: string, data: ProjectFormData) {
    const { error } = await updateProject(id, data);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/${id}`);
    revalidatePath('/in-the-works');
    redirect('/admin/projects');
}

export async function deleteProjectAction(id: string) {
    const { error } = await deleteProject(id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/projects');
    revalidatePath('/in-the-works');
}

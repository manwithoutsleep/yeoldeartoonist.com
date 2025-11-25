'use server';

import {
    createAdmin,
    updateAdmin,
    deactivateAdmin,
    type CreateAdminInput,
    type UpdateAdminInput,
    type AdminRow,
} from '@/lib/db/admin/administrators';
import { createAdminSchema, updateAdminSchema } from '@/lib/validation/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { AdministratorError } from '@/lib/db/admin/administrators';

/**
 * Server action to create a new admin user
 * Validates input, creates user, and revalidates settings page
 */
export async function createAdminAction(formData: CreateAdminInput): Promise<{
    data: AdminRow | null;
    error: AdministratorError | null;
}> {
    // Validate input
    const validation = createAdminSchema.safeParse(formData);
    if (!validation.success) {
        const issues = validation.error.issues;
        return {
            data: null,
            error: {
                code: 'validation_error',
                message: issues[0].message,
                details: issues
                    .map((e) => `${e.path.join('.')}: ${e.message}`)
                    .join(', '),
            },
        };
    }

    // Create admin
    const result = await createAdmin(validation.data);

    // Revalidate settings page on success
    if (result.data) {
        revalidatePath('/admin/settings');
    }

    return result;
}

/**
 * Server action to update an existing admin user
 * Validates input, updates user, and revalidates settings page
 */
export async function updateAdminAction(
    id: string,
    formData: UpdateAdminInput
): Promise<{
    data: AdminRow | null;
    error: AdministratorError | null;
}> {
    // Validate input
    const validation = updateAdminSchema.safeParse(formData);
    if (!validation.success) {
        const issues = validation.error.issues;
        return {
            data: null,
            error: {
                code: 'validation_error',
                message: issues[0].message,
                details: issues
                    .map((e) => `${e.path.join('.')}: ${e.message}`)
                    .join(', '),
            },
        };
    }

    // Update admin
    const result = await updateAdmin(id, validation.data);

    // Revalidate settings page on success
    if (result.data) {
        revalidatePath('/admin/settings');
    }

    return result;
}

/**
 * Server action to deactivate an admin user
 * Prevents self-deactivation, deactivates user, and revalidates settings page
 */
export async function deactivateAdminAction(id: string): Promise<{
    data: AdminRow | null;
    error: AdministratorError | null;
}> {
    // Get current admin session to prevent self-deactivation
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value);
            if (session.adminId === id) {
                return {
                    data: null,
                    error: {
                        code: 'self_deactivation',
                        message: 'Cannot deactivate yourself',
                    },
                };
            }
        } catch {
            // If we can't parse session, continue with deactivation
            // (will be caught by middleware later if unauthorized)
        }
    }

    // Deactivate admin
    const result = await deactivateAdmin(id);

    // Revalidate settings page on success
    if (result.data) {
        revalidatePath('/admin/settings');
    }

    return result;
}

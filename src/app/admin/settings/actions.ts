'use server';

import {
    createAdmin,
    updateAdmin,
    deactivateAdmin,
    type UpdateAdminInput,
    type AdminRow,
} from '@/lib/db/admin/administrators';
import { createAdminSchema, updateAdminSchema } from '@/lib/validation/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { AdministratorError } from '@/lib/db/admin/administrators';

/**
 * Input type for creating an admin - matches what the form sends
 */
export interface CreateAdminActionInput {
    name: string;
    email: string;
    role: 'admin' | 'super_admin';
    password: string;
    passwordConfirm: string;
}

/**
 * Server action to create a new admin user
 * Validates input, creates user, and revalidates settings page
 */
export async function createAdminAction(
    formData: CreateAdminActionInput
): Promise<{
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

    // Remove passwordConfirm before creating admin (only needed for validation)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirm, ...adminData } = validation.data;

    // Create admin
    const result = await createAdmin(adminData);

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
    if (process.env.NODE_ENV === 'development') {
        console.log('[updateAdminAction] Called with id:', id);
        console.log('[updateAdminAction] formData:', formData);
    }

    // Get current admin session to check if this is the last super admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    let currentAdminId: string | null = null;

    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value);
            currentAdminId = session.adminId;
        } catch {
            // If we can't parse session, continue with update
        }
    }

    // Check if this is the last active super admin trying to demote or deactivate themselves
    if (currentAdminId === id) {
        const { getAllAdmins } = await import('@/lib/db/admin/administrators');
        const { data: allAdmins } = await getAllAdmins();

        if (allAdmins) {
            const activeSuperAdmins = allAdmins.filter(
                (admin) => admin.role === 'super_admin' && admin.is_active
            );

            const isLastSuperAdmin =
                activeSuperAdmins.length === 1 &&
                activeSuperAdmins[0].id === currentAdminId;

            if (isLastSuperAdmin) {
                // Prevent role change from super_admin to admin
                if (formData.role && formData.role !== 'super_admin') {
                    return {
                        data: null,
                        error: {
                            code: 'last_super_admin',
                            message:
                                'Cannot change role - you are the last active Super Admin',
                        },
                    };
                }

                // Prevent deactivation
                if (formData.is_active === false) {
                    return {
                        data: null,
                        error: {
                            code: 'last_super_admin',
                            message:
                                'Cannot deactivate - you are the last active Super Admin',
                        },
                    };
                }
            }
        }
    }

    // Validate input
    const validation = updateAdminSchema.safeParse(formData);
    if (process.env.NODE_ENV === 'development') {
        console.log('[updateAdminAction] Validation result:', validation);
    }

    if (!validation.success) {
        const issues = validation.error.issues;
        if (process.env.NODE_ENV === 'development') {
            console.log('[updateAdminAction] Validation errors:', issues);
        }
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

    // Remove passwordConfirm before updating admin (only needed for validation)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirm, ...adminData } = validation.data;

    if (process.env.NODE_ENV === 'development') {
        console.log(
            '[updateAdminAction] Calling updateAdmin with validated data:',
            adminData
        );
    }

    // Update admin
    const result = await updateAdmin(id, adminData);

    if (process.env.NODE_ENV === 'development') {
        console.log('[updateAdminAction] updateAdmin result:', result);
    }

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
    let currentAdminId: string | null = null;

    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value);
            currentAdminId = session.adminId;
        } catch {
            // If we can't parse session, continue with deactivation
            // (will be caught by middleware later if unauthorized)
        }
    }

    // Check if this is the last active super admin
    const { getAllAdmins } = await import('@/lib/db/admin/administrators');
    const { data: allAdmins } = await getAllAdmins();

    if (allAdmins) {
        const activeSuperAdmins = allAdmins.filter(
            (admin) => admin.role === 'super_admin' && admin.is_active
        );

        const isLastSuperAdmin =
            activeSuperAdmins.length === 1 &&
            activeSuperAdmins[0].id === currentAdminId &&
            currentAdminId === id;

        if (isLastSuperAdmin) {
            return {
                data: null,
                error: {
                    code: 'last_super_admin',
                    message:
                        'Cannot deactivate - you are the last active Super Admin',
                },
            };
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

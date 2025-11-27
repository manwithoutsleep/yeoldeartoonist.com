import { z } from 'zod';

/**
 * Base admin schema for common validation rules
 */
export const adminSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'super_admin'], {
        message: 'Role must be admin or super_admin',
    }),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .optional(),
    passwordConfirm: z.string().optional(),
    is_active: z.boolean().default(true),
});

/**
 * Schema for creating a new admin user
 * Password is required for new admins and must match confirmation
 */
export const createAdminSchema = adminSchema
    .extend({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        passwordConfirm: z.string().min(1, 'Please retype password'),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: 'Passwords do not match',
        path: ['passwordConfirm'],
    });

/**
 * Schema for updating an existing admin user
 * All fields are optional, password is optional
 * Email is excluded as it cannot be updated this way
 * If password is provided, confirmation is required and must match
 */
export const updateAdminSchema = adminSchema
    .omit({ email: true })
    .partial()
    .refine(
        (data) => {
            // If password is provided, passwordConfirm must also be provided and match
            if (data.password && data.password.length > 0) {
                return (
                    data.passwordConfirm &&
                    data.password === data.passwordConfirm
                );
            }
            return true;
        },
        {
            message: 'Passwords do not match',
            path: ['passwordConfirm'],
        }
    );

/**
 * TypeScript types inferred from schemas
 */
export type AdminInput = z.infer<typeof adminSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;

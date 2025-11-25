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
    is_active: z.boolean().default(true),
});

/**
 * Schema for creating a new admin user
 * Password is required for new admins
 */
export const createAdminSchema = adminSchema.extend({
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Schema for updating an existing admin user
 * All fields are optional, password is optional
 */
export const updateAdminSchema = adminSchema.partial();

/**
 * TypeScript types inferred from schemas
 */
export type AdminInput = z.infer<typeof adminSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;

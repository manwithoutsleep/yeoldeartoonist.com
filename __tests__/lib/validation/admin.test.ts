import { describe, expect, it } from 'vitest';
import {
    adminSchema,
    createAdminSchema,
    updateAdminSchema,
} from '@/lib/validation/admin';

describe('admin validation schemas', () => {
    describe('adminSchema', () => {
        it('validates valid admin data', () => {
            const validData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin' as const,
                password: 'password123',
                is_active: true,
            };

            const result = adminSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('validates super_admin role', () => {
            const validData = {
                name: 'Jane Admin',
                email: 'jane@example.com',
                role: 'super_admin' as const,
                password: 'password123',
                is_active: true,
            };

            const result = adminSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('requires name', () => {
            const invalidData = {
                email: 'test@example.com',
                role: 'admin' as const,
                password: 'password123',
            };

            const result = adminSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path[0]).toBe('name');
            }
        });

        it('rejects empty name', () => {
            const invalidData = {
                name: '',
                email: 'test@example.com',
                role: 'admin' as const,
                password: 'password123',
            };

            const result = adminSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('requires email', () => {
            const invalidData = {
                name: 'John Doe',
                role: 'admin' as const,
                password: 'password123',
            };

            const result = adminSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path[0]).toBe('email');
            }
        });

        it('validates email format', () => {
            const invalidData = {
                name: 'John Doe',
                email: 'not-an-email',
                role: 'admin' as const,
                password: 'password123',
            };

            const result = adminSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('email');
            }
        });

        it('rejects invalid role', () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'invalid_role',
                password: 'password123',
            };

            const result = adminSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('allows optional password', () => {
            const validData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin' as const,
                is_active: true,
            };

            const result = adminSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('validates password minimum length when provided', () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin' as const,
                password: 'short',
            };

            const result = adminSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('8');
            }
        });

        it('defaults is_active to true when not provided', () => {
            const validData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin' as const,
                password: 'password123',
            };

            const result = adminSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.is_active).toBe(true);
            }
        });
    });

    describe('createAdminSchema', () => {
        it('requires password for create mode', () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin' as const,
            };

            const result = createAdminSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path[0]).toBe('password');
            }
        });

        it('requires password to be at least 8 characters', () => {
            const invalidData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin' as const,
                password: 'short',
            };

            const result = createAdminSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('8');
            }
        });

        it('validates complete admin data for creation', () => {
            const validData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin' as const,
                password: 'password123',
            };

            const result = createAdminSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    describe('updateAdminSchema', () => {
        it('allows update without password', () => {
            const validData = {
                name: 'John Doe Updated',
                role: 'super_admin' as const,
                is_active: false,
            };

            const result = updateAdminSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('validates password length when provided', () => {
            const invalidData = {
                name: 'John Doe',
                password: 'short',
            };

            const result = updateAdminSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('8');
            }
        });

        it('allows partial updates', () => {
            const validData = {
                name: 'John Doe Updated',
            };

            const result = updateAdminSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('allows updating only role', () => {
            const validData = {
                role: 'super_admin' as const,
            };

            const result = updateAdminSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('allows updating only is_active', () => {
            const validData = {
                is_active: false,
            };

            const result = updateAdminSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });
});

'use client';

import { useState } from 'react';
import type { AdminRow } from '@/lib/db/admin/administrators';

// Separate interfaces for create and edit modes
export interface CreateAdminFormData {
    name: string;
    email: string; // Required for create
    role: 'admin' | 'super_admin';
    password: string;
    passwordConfirm: string;
}

export interface EditAdminFormData {
    name: string;
    role: 'admin' | 'super_admin';
    password?: string;
    passwordConfirm?: string;
    is_active?: boolean;
}

// Union type for backward compatibility
export type AdminFormData = CreateAdminFormData | EditAdminFormData;

// Props for create mode
interface CreateAdminFormProps {
    mode: 'create';
    initialData?: never;
    onSubmit: (data: CreateAdminFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    disableRoleChange?: never;
    disableActiveToggle?: never;
    error?: string | null;
    onErrorDismiss?: () => void;
}

// Props for edit mode
interface EditAdminFormProps {
    mode: 'edit';
    initialData: AdminRow;
    onSubmit: (data: EditAdminFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    disableRoleChange?: boolean;
    disableActiveToggle?: boolean;
    error?: string | null;
    onErrorDismiss?: () => void;
}

// Union of both prop types
type AdminFormProps = CreateAdminFormProps | EditAdminFormProps;

export function AdminForm(props: AdminFormProps) {
    const {
        mode,
        onSubmit,
        onCancel,
        isLoading = false,
        error,
        onErrorDismiss,
    } = props;

    // Type-safe state initialization based on mode
    const [formData, setFormData] = useState<
        CreateAdminFormData | EditAdminFormData
    >(() => {
        if (mode === 'create') {
            return {
                name: '',
                email: '', // Always initialize as empty string, never undefined
                role: 'admin',
                password: '',
                passwordConfirm: '',
            };
        } else {
            // mode === 'edit'
            const { initialData } = props;
            return {
                name: initialData.name,
                role: initialData.role,
                password: '',
                passwordConfirm: '',
                is_active: initialData.is_active ?? true,
            };
        }
    });

    // Extract mode-specific props after mode check
    const disableRoleChange = mode === 'edit' ? props.disableRoleChange : false;
    const disableActiveToggle =
        mode === 'edit' ? props.disableActiveToggle : false;

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (mode === 'create') {
            const createData = formData as CreateAdminFormData;
            if (!createData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createData.email)) {
                newErrors.email = 'Invalid email address';
            }

            if (!createData.password) {
                newErrors.password = 'Password is required';
            } else if (createData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }

            if (!createData.passwordConfirm) {
                newErrors.passwordConfirm = 'Please retype password';
            } else if (createData.password !== createData.passwordConfirm) {
                newErrors.passwordConfirm = 'Passwords do not match';
            }
        }

        if (mode === 'edit') {
            const editData = formData as EditAdminFormData;
            if (editData.password) {
                if (editData.password.length < 8) {
                    newErrors.password =
                        'Password must be at least 8 characters';
                }

                if (!editData.passwordConfirm) {
                    newErrors.passwordConfirm = 'Please retype password';
                } else if (editData.password !== editData.passwordConfirm) {
                    newErrors.passwordConfirm = 'Passwords do not match';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        // Type-safe submission based on mode
        if (mode === 'create') {
            await onSubmit(formData as CreateAdminFormData);
        } else {
            await onSubmit(formData as EditAdminFormData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-1">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                        {onErrorDismiss && (
                            <button
                                type="button"
                                onClick={onErrorDismiss}
                                className="ml-3 text-red-500 hover:text-red-700"
                                aria-label="Dismiss error"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                >
                    Name *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            {mode === 'create' && (
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={(formData as CreateAdminFormData).email}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                email: e.target.value,
                            } as CreateAdminFormData)
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.email}
                        </p>
                    )}
                </div>
            )}

            <div>
                <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                >
                    Role *
                </label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            role: e.target.value as 'admin' | 'super_admin',
                        })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={isLoading || disableRoleChange}
                >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
                {disableRoleChange && (
                    <p className="mt-1 text-sm text-amber-600">
                        Cannot change role - you are the last active Super Admin
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >
                    Password {mode === 'create' ? '*' : '(optional)'}
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.password}
                    </p>
                )}
                {mode === 'create' && (
                    <p className="mt-1 text-sm text-gray-500">
                        Minimum 8 characters
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="passwordConfirm"
                    className="block text-sm font-medium text-gray-700"
                >
                    Retype Password {mode === 'create' ? '*' : '(optional)'}
                </label>
                <input
                    type="password"
                    id="passwordConfirm"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            passwordConfirm: e.target.value,
                        })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
                {errors.passwordConfirm && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.passwordConfirm}
                    </p>
                )}
            </div>

            {mode === 'edit' && (
                <div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={(formData as EditAdminFormData).is_active}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    is_active: e.target.checked,
                                } as EditAdminFormData)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isLoading || disableActiveToggle}
                        />
                        <label
                            htmlFor="is_active"
                            className="ml-2 block text-sm text-gray-900"
                        >
                            Active
                        </label>
                    </div>
                    {disableActiveToggle && (
                        <p className="mt-1 text-sm text-amber-600">
                            Cannot deactivate - you are the last active Super
                            Admin
                        </p>
                    )}
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading
                        ? 'Saving...'
                        : mode === 'create'
                          ? 'Create Admin'
                          : 'Update Admin'}
                </button>
            </div>
        </form>
    );
}

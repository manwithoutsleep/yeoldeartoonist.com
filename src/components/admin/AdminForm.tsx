'use client';

import { useState } from 'react';
import type { AdminRow } from '@/lib/db/admin/administrators';

interface AdminFormProps {
    mode: 'create' | 'edit';
    initialData?: AdminRow;
    onSubmit: (data: AdminFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    disableRoleChange?: boolean;
    disableActiveToggle?: boolean;
    error?: string | null;
    onErrorDismiss?: () => void;
}

export interface AdminFormData {
    name: string;
    email?: string;
    role: 'admin' | 'super_admin';
    password?: string;
    passwordConfirm?: string;
    is_active?: boolean;
}

export function AdminForm({
    mode,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    disableRoleChange = false,
    disableActiveToggle = false,
    error,
    onErrorDismiss,
}: AdminFormProps) {
    const [formData, setFormData] = useState<AdminFormData>({
        name: initialData?.name || '',
        email: initialData?.email || '',
        role: initialData?.role || 'admin',
        password: '',
        passwordConfirm: '',
        is_active: initialData?.is_active ?? true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (mode === 'create') {
            if (!formData.email?.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Invalid email address';
            }

            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }

            if (!formData.passwordConfirm) {
                newErrors.passwordConfirm = 'Please retype password';
            } else if (formData.password !== formData.passwordConfirm) {
                newErrors.passwordConfirm = 'Passwords do not match';
            }
        }

        if (mode === 'edit' && formData.password) {
            if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }

            if (!formData.passwordConfirm) {
                newErrors.passwordConfirm = 'Please retype password';
            } else if (formData.password !== formData.passwordConfirm) {
                newErrors.passwordConfirm = 'Passwords do not match';
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

        await onSubmit(formData);
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
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
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
                            checked={formData.is_active}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    is_active: e.target.checked,
                                })
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

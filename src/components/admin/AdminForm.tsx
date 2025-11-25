'use client';

import { useState } from 'react';
import type { AdminRow } from '@/lib/db/admin/administrators';

interface AdminFormProps {
    mode: 'create' | 'edit';
    initialData?: AdminRow;
    onSubmit: (data: AdminFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export interface AdminFormData {
    name: string;
    email?: string;
    role: 'admin' | 'super_admin';
    password?: string;
    is_active?: boolean;
}

export function AdminForm({
    mode,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: AdminFormProps) {
    const [formData, setFormData] = useState<AdminFormData>({
        name: initialData?.name || '',
        email: initialData?.email || '',
        role: initialData?.role || 'admin',
        password: '',
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
        }

        if (
            mode === 'edit' &&
            formData.password &&
            formData.password.length < 8
        ) {
            newErrors.password = 'Password must be at least 8 characters';
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    disabled={isLoading}
                >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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

            {mode === 'edit' && (
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
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <label
                        htmlFor="is_active"
                        className="ml-2 block text-sm text-gray-900"
                    >
                        Active
                    </label>
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

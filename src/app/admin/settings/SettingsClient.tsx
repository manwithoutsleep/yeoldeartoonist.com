'use client';

import { useState } from 'react';
import type { AdminRow } from '@/lib/db/admin/administrators';
import { AdminForm, type AdminFormData } from '@/components/admin/AdminForm';
import {
    createAdminAction,
    updateAdminAction,
    deactivateAdminAction,
} from './actions';

interface SettingsClientProps {
    admins: AdminRow[];
    currentAdminId: string;
}

export function SettingsClient({
    admins,
    currentAdminId,
}: SettingsClientProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminRow | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [deactivateError, setDeactivateError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Check if there's only one active super admin
    const activeSuperAdmins = admins.filter(
        (admin) => admin.role === 'super_admin' && admin.is_active
    );
    const isLastSuperAdmin =
        activeSuperAdmins.length === 1 &&
        activeSuperAdmins[0].id === currentAdminId;

    const handleCreateSubmit = async (data: AdminFormData) => {
        setIsLoading(true);
        setCreateError(null);

        const result = await createAdminAction({
            name: data.name,
            email: data.email!,
            role: data.role,
            password: data.password!,
        });

        setIsLoading(false);

        if (result.error) {
            setCreateError(result.error.message);
        } else {
            setSuccess('Admin created successfully');
            setShowCreateModal(false);
            setCreateError(null);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    const handleEditSubmit = async (data: AdminFormData) => {
        if (!editingAdmin) return;

        console.log('[handleEditSubmit] editingAdmin:', editingAdmin);
        console.log('[handleEditSubmit] data:', data);
        console.log('[handleEditSubmit] editingAdmin.id:', editingAdmin.id);

        setIsLoading(true);
        setEditError(null);

        const updateData: {
            name: string;
            role: 'admin' | 'super_admin';
            is_active?: boolean;
            password?: string;
            passwordConfirm?: string;
        } = {
            name: data.name,
            role: data.role,
            is_active: data.is_active,
        };

        // Include password fields if password is being changed
        if (data.password) {
            updateData.password = data.password;
            updateData.passwordConfirm = data.passwordConfirm;
        }

        console.log('[handleEditSubmit] updateData:', updateData);

        const result = await updateAdminAction(editingAdmin.id, updateData);

        console.log('[handleEditSubmit] result:', result);

        setIsLoading(false);

        if (result.error) {
            console.log('[handleEditSubmit] Error:', result.error);
            setEditError(result.error.message);
        } else {
            console.log('[handleEditSubmit] Success!');
            setSuccess('Admin updated successfully');
            setEditingAdmin(null);
            setEditError(null);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    const handleDeactivate = async (admin: AdminRow) => {
        if (!confirm(`Are you sure you want to deactivate ${admin.name}?`)) {
            return;
        }

        setIsLoading(true);
        setDeactivateError(null);

        const result = await deactivateAdminAction(admin.id);

        setIsLoading(false);

        if (result.error) {
            setDeactivateError(result.error.message);
        } else {
            setSuccess('Admin deactivated successfully');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Error/Success Messages */}
            {deactivateError && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{deactivateError}</p>
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}

            {/* Admin Users Section */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">
                            Admin Users
                        </h2>
                        <button
                            onClick={() => {
                                setCreateError(null);
                                setShowCreateModal(true);
                            }}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Add New Admin
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                        Name
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Email
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Role
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {admins.map((admin) => (
                                    <tr key={admin.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                            {admin.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {admin.email}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                    admin.role === 'super_admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {admin.role === 'super_admin'
                                                    ? 'Super Admin'
                                                    : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                    admin.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {admin.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                            <button
                                                onClick={() => {
                                                    setEditError(null);
                                                    setEditingAdmin(admin);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeactivate(admin)
                                                }
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={
                                                    (admin.id ===
                                                        currentAdminId &&
                                                        isLastSuperAdmin) ||
                                                    !admin.is_active ||
                                                    isLoading
                                                }
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Site Settings Section (placeholder) */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Site Settings
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Coming soon: Manage shipping costs, tax rates, social
                        media links, and other site configuration.
                    </p>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                Add New Admin
                            </h3>
                            <AdminForm
                                mode="create"
                                onSubmit={handleCreateSubmit}
                                onCancel={() => {
                                    setCreateError(null);
                                    setShowCreateModal(false);
                                }}
                                isLoading={isLoading}
                                error={createError}
                                onErrorDismiss={() => setCreateError(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingAdmin && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setEditingAdmin(null)}
                        />
                        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                Edit Admin
                            </h3>
                            <AdminForm
                                mode="edit"
                                initialData={editingAdmin}
                                onSubmit={handleEditSubmit}
                                onCancel={() => {
                                    setEditError(null);
                                    setEditingAdmin(null);
                                }}
                                isLoading={isLoading}
                                disableRoleChange={
                                    isLastSuperAdmin &&
                                    editingAdmin.id === currentAdminId
                                }
                                disableActiveToggle={
                                    isLastSuperAdmin &&
                                    editingAdmin.id === currentAdminId
                                }
                                error={editError}
                                onErrorDismiss={() => setEditError(null)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

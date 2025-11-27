import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAllAdmins } from '@/lib/db/admin/administrators';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
    // Check if current user is super_admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
        redirect('/admin/login');
    }

    let session;
    try {
        session = JSON.parse(sessionCookie.value);
    } catch {
        redirect('/admin/login');
    }

    if (session.role !== 'super_admin') {
        redirect('/admin?error=access_denied');
    }

    // Fetch all administrators
    const { data: admins, error } = await getAllAdmins();

    if (error) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <h3 className="text-sm font-medium text-red-800">
                    Error Loading Administrators
                </h3>
                <p className="mt-1 text-sm text-red-700">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Manage admin users and site configuration
                </p>
            </div>

            <SettingsClient
                admins={admins || []}
                currentAdminId={session.adminId}
            />
        </div>
    );
}

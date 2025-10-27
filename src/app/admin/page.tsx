'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminPage() {
    const router = useRouter();
    const { signOut, loading: signOutLoading } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push('/admin/login');
                return;
            }

            setUser(session.user);
            setLoading(false);
        };

        getUser();
    }, [router]);

    const handleSignOut = async () => {
        const { error } = await signOut();
        if (!error) {
            router.push('/admin/login');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Admin Panel
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {user?.email}
                            </span>
                            <button
                                onClick={handleSignOut}
                                disabled={signOutLoading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
                            >
                                {signOutLoading ? 'Signing out...' : 'Sign out'}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Welcome to Admin Panel
                    </h2>
                    <p className="text-gray-600">
                        You are logged in as <strong>{user?.email}</strong>
                    </p>
                    <p className="text-gray-600 mt-2">
                        This is a placeholder admin dashboard. Add your content
                        here.
                    </p>
                </div>
            </main>
        </div>
    );
}

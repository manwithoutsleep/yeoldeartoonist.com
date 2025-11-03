/**
 * Tests for Admin Page
 *
 * The admin page is a client component that:
 * - Requires authentication (redirects to login if no session)
 * - Displays current user email
 * - Shows a loading state while fetching session
 * - Allows users to sign out
 * - Handles sign out errors gracefully
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { SupabaseClient } from '@supabase/supabase-js';
import AdminPage from '@/app/admin/page';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

// Type definitions for mocks
interface MockAuthHookReturn {
    signOut: jest.Mock;
    loading: boolean;
}

interface MockSupabaseSession {
    user?: {
        id: string;
        email: string;
    };
}

interface MockSupabaseClient extends Pick<SupabaseClient, 'auth'> {
    auth: {
        getSession: jest.Mock;
    };
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    createClient: jest.fn(),
}));

// Mock useAuth hook
jest.mock('@/lib/hooks/useAuth', () => ({
    useAuth: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockCreateClient = createClient as jest.MockedFunction<
    typeof createClient
>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Admin Page', () => {
    const mockPush = jest.fn();
    const mockSignOut = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue({
            push: mockPush,
        } as AppRouterInstance);
    });

    describe('Authentication & Session', () => {
        it('should redirect to login when no session exists', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: null },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/admin/login');
            });
        });

        it('should display loading state while fetching session', () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockImplementation(
                        () => new Promise(() => {}) // Never resolves
                    ),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should render admin page when session exists', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                expect(
                    screen.queryByText('Loading...')
                ).not.toBeInTheDocument();
            });

            expect(screen.getByText('Admin Panel')).toBeInTheDocument();
            expect(
                screen.getByText('Welcome to Admin Panel')
            ).toBeInTheDocument();
        });
    });

    describe('User Display', () => {
        it('should display user email in header', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'testuser@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                const emails = screen.getAllByText('testuser@example.com');
                expect(emails.length).toBeGreaterThan(0);
            });
        });

        it('should display user email in welcome message', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'john@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                const emailInWelcome = screen.getAllByText('john@example.com');
                expect(emailInWelcome.length).toBeGreaterThan(1); // Header + welcome message
            });
        });

        it('should display correct welcome message content', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                expect(
                    screen.getByText('You are logged in as')
                ).toBeInTheDocument();
                expect(
                    screen.getByText(/This is a placeholder admin dashboard/)
                ).toBeInTheDocument();
            });
        });
    });

    describe('Loading State', () => {
        it('should clear loading state after user data loads', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            // Initially should show loading
            expect(screen.getByText('Loading...')).toBeInTheDocument();

            // After session loads, should not show loading
            await waitFor(() => {
                expect(
                    screen.queryByText('Loading...')
                ).not.toBeInTheDocument();
            });
        });
    });

    describe('Sign Out Functionality', () => {
        it('should display sign out button when authenticated', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                const signOutButton = screen.getByText('Sign out');
                expect(signOutButton).toBeInTheDocument();
            });
        });

        it('should be able to click sign out button', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            mockSignOut.mockResolvedValue({ error: null });

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                expect(screen.getByText('Sign out')).toBeInTheDocument();
            });

            const signOutButton = screen.getByText('Sign out');
            fireEvent.click(signOutButton);

            await waitFor(() => {
                expect(mockSignOut).toHaveBeenCalled();
            });
        });

        it('should disable sign out button while signing out', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: true, // Simulate loading state
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                const signOutButton = screen.getByText(
                    'Signing out...'
                ) as HTMLButtonElement;
                expect(signOutButton).toBeDisabled();
            });
        });

        it('should show "Signing out..." text while signing out', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: true,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                expect(screen.getByText('Signing out...')).toBeInTheDocument();
            });
        });

        it('should redirect to login after successful sign out', async () => {
            const signOutLoading = false;

            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: signOutLoading,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            mockSignOut.mockResolvedValue({ error: null });

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                expect(screen.getByText('Sign out')).toBeInTheDocument();
            });

            const signOutButton = screen.getByText('Sign out');
            fireEvent.click(signOutButton);

            await waitFor(() => {
                expect(mockSignOut).toHaveBeenCalled();
            });

            // After successful sign out, should redirect to login
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/admin/login');
            });
        });

        it('should handle sign out errors gracefully', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            mockSignOut.mockResolvedValue({
                error: { message: 'Sign out failed' },
            });

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                expect(screen.getByText('Sign out')).toBeInTheDocument();
            });

            const signOutButton = screen.getByText('Sign out');
            fireEvent.click(signOutButton);

            await waitFor(() => {
                expect(mockSignOut).toHaveBeenCalled();
            });

            // Should NOT redirect if there's an error
            expect(mockPush).not.toHaveBeenCalledWith('/admin/login');
        });
    });

    describe('UI Elements', () => {
        it('should have admin panel heading', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                expect(screen.getByText('Admin Panel')).toBeInTheDocument();
            });
        });

        it('should have white background for nav', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            const { container } = render(<AdminPage />);

            await waitFor(() => {
                const nav = container.querySelector('.bg-white');
                expect(nav).toBeInTheDocument();
            });
        });

        it('should have gray background for main area', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            const { container } = render(<AdminPage />);

            await waitFor(() => {
                const main = container.querySelector('.bg-gray-100');
                expect(main).toBeInTheDocument();
            });
        });

        it('should have white content card', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-123',
                    email: 'admin@example.com',
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            const { container } = render(<AdminPage />);

            await waitFor(() => {
                const card = container.querySelector('.bg-white.rounded-lg');
                expect(card).toBeInTheDocument();
            });
        });
    });

    describe('Session Retrieval', () => {
        it('should call getSession on component mount', async () => {
            const mockGetSession = jest.fn().mockResolvedValue({
                data: { session: null },
            });

            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: mockGetSession,
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                expect(mockGetSession).toHaveBeenCalled();
            });
        });

        it('should set user from session data', async () => {
            const mockAuthReturn: MockAuthHookReturn = {
                signOut: mockSignOut,
                loading: false,
            };
            mockUseAuth.mockReturnValue(mockAuthReturn);

            const testEmail = 'test@example.com';
            const mockSession: MockSupabaseSession = {
                user: {
                    id: 'user-456',
                    email: testEmail,
                },
            };

            const mockClient: MockSupabaseClient = {
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: mockSession },
                    }),
                },
            };
            mockCreateClient.mockReturnValue(
                mockClient as unknown as ReturnType<typeof createClient>
            );

            render(<AdminPage />);

            await waitFor(() => {
                const emails = screen.getAllByText(testEmail);
                expect(emails.length).toBeGreaterThan(0);
            });
        });
    });
});

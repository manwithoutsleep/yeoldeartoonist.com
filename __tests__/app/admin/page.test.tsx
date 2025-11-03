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
import AdminPage from '@/app/admin/page';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

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
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Admin Page', () => {
    const mockPush = jest.fn();
    const mockSignOut = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue({
            push: mockPush,
        } as any);
    });

    describe('Authentication & Session', () => {
        it('should redirect to login when no session exists', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: { session: null },
                    }),
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/admin/login');
            });
        });

        it('should display loading state while fetching session', () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockImplementation(
                        () => new Promise(() => {}) // Never resolves
                    ),
                },
            } as any);

            render(<AdminPage />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should render admin page when session exists', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            });

            expect(screen.getByText('Admin Panel')).toBeInTheDocument();
            expect(screen.getByText('Welcome to Admin Panel')).toBeInTheDocument();
        });
    });

    describe('User Display', () => {
        it('should display user email in header', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'testuser@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                const emails = screen.getAllByText('testuser@example.com');
                expect(emails.length).toBeGreaterThan(0);
            });
        });

        it('should display user email in welcome message', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'john@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                const emailInWelcome = screen.getAllByText('john@example.com');
                expect(emailInWelcome.length).toBeGreaterThan(1); // Header + welcome message
            });
        });

        it('should display correct welcome message content', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

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
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            render(<AdminPage />);

            // Initially should show loading
            expect(screen.getByText('Loading...')).toBeInTheDocument();

            // After session loads, should not show loading
            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            });
        });
    });

    describe('Sign Out Functionality', () => {
        it('should display sign out button when authenticated', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                const signOutButton = screen.getByText('Sign out');
                expect(signOutButton).toBeInTheDocument();
            });
        });

        it('should be able to click sign out button', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockSignOut.mockResolvedValue({ error: null });

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

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
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: true, // Simulate loading state
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                const signOutButton = screen.getByText(
                    'Signing out...'
                ) as HTMLButtonElement;
                expect(signOutButton).toBeDisabled();
            });
        });

        it('should show "Signing out..." text while signing out', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: true,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                expect(screen.getByText('Signing out...')).toBeInTheDocument();
            });
        });

        it('should redirect to login after successful sign out', async () => {
            let signOutLoading = false;

            mockUseAuth.mockImplementation(() => ({
                signOut: mockSignOut,
                loading: signOutLoading,
            } as any));

            mockSignOut.mockResolvedValue({ error: null });

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

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
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockSignOut.mockResolvedValue({
                error: { message: 'Sign out failed' },
            });

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

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
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                expect(screen.getByText('Admin Panel')).toBeInTheDocument();
            });
        });

        it('should have white background for nav', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            const { container } = render(<AdminPage />);

            await waitFor(() => {
                const nav = container.querySelector('.bg-white');
                expect(nav).toBeInTheDocument();
            });
        });

        it('should have gray background for main area', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

            const { container } = render(<AdminPage />);

            await waitFor(() => {
                const main = container.querySelector('.bg-gray-100');
                expect(main).toBeInTheDocument();
            });
        });

        it('should have white content card', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: {
                                    id: 'user-123',
                                    email: 'admin@example.com',
                                },
                            },
                        },
                    }),
                },
            } as any);

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

            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: mockGetSession,
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                expect(mockGetSession).toHaveBeenCalled();
            });
        });

        it('should set user from session data', async () => {
            mockUseAuth.mockReturnValue({
                signOut: mockSignOut,
                loading: false,
            } as any);

            const testUser = {
                id: 'user-456',
                email: 'test@example.com',
            };

            mockCreateClient.mockReturnValue({
                auth: {
                    getSession: jest.fn().mockResolvedValue({
                        data: {
                            session: {
                                user: testUser,
                            },
                        },
                    }),
                },
            } as any);

            render(<AdminPage />);

            await waitFor(() => {
                const emails = screen.getAllByText(testUser.email);
                expect(emails.length).toBeGreaterThan(0);
            });
        });
    });
});

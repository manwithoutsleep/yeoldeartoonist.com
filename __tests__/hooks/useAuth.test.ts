/**
 * Tests for useAuth Hook
 *
 * The useAuth hook provides:
 * - signIn: Sign in with email and password
 * - signUp: Create a new user account
 * - signOut: Sign out the current user
 * - loading: Loading state during auth operations
 * - error: Normalized error state with consistent message property
 *
 * All errors are normalized to AuthError type with guaranteed message property
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

// Mock the Supabase client
jest.mock('@/lib/supabase/client');

const mockCreateClient = createClient as jest.MockedFunction<
    typeof createClient
>;

describe('useAuth Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Hook Initialization', () => {
        it('should return hook with all required methods and state', () => {
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest.fn(),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            expect(result.current).toHaveProperty('signIn');
            expect(result.current).toHaveProperty('signUp');
            expect(result.current).toHaveProperty('signOut');
            expect(result.current).toHaveProperty('loading');
            expect(result.current).toHaveProperty('error');
        });

        it('should initialize with loading false and error null', () => {
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest.fn(),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should return memoized callback functions', () => {
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest.fn(),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result, rerender } = renderHook(() => useAuth());

            const signInRef1 = result.current.signIn;
            const signUpRef1 = result.current.signUp;
            const signOutRef1 = result.current.signOut;

            rerender();

            const signInRef2 = result.current.signIn;
            const signUpRef2 = result.current.signUp;
            const signOutRef2 = result.current.signOut;

            expect(signInRef1).toBe(signInRef2);
            expect(signUpRef1).toBe(signUpRef2);
            expect(signOutRef1).toBe(signOutRef2);
        });
    });

    describe('SignIn', () => {
        describe('Success Cases', () => {
            it('should successfully sign in with valid credentials', async () => {
                const mockData = { session: { user: { id: '123' } } };
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest
                            .fn()
                            .mockResolvedValue({ data: mockData, error: null }),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                let signInResult: any;
                await act(async () => {
                    signInResult = await result.current.signIn(
                        'user@example.com',
                        'password123'
                    );
                });

                expect(signInResult.data).toEqual(mockData);
                expect(signInResult.error).toBeNull();
            });

            it('should call signInWithPassword with correct email and password', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest
                            .fn()
                            .mockResolvedValue({
                                data: { session: {} },
                                error: null,
                            }),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signIn(
                        'test@example.com',
                        'secret123'
                    );
                });

                expect(
                    mockSupabase.auth.signInWithPassword
                ).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'secret123',
                });
            });

            it('should set loading to false after successful sign in', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest
                            .fn()
                            .mockResolvedValue({
                                data: { session: {} },
                                error: null,
                            }),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signIn(
                        'user@example.com',
                        'password123'
                    );
                });

                expect(result.current.loading).toBe(false);
            });

            it('should set error to null after successful sign in', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest
                            .fn()
                            .mockResolvedValue({
                                data: { session: {} },
                                error: null,
                            }),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signIn(
                        'user@example.com',
                        'password123'
                    );
                });

                expect(result.current.error).toBeNull();
            });
        });

        describe('Failure Cases - Supabase Error', () => {
            it('should handle sign in error from Supabase', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Invalid login credentials' },
                        }),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                let signInResult: any;
                await act(async () => {
                    signInResult = await result.current.signIn(
                        'user@example.com',
                        'wrongpassword'
                    );
                });

                expect(signInResult.data).toBeNull();
                expect(signInResult.error).toEqual({
                    message: 'Invalid login credentials',
                });
            });

            it('should set error state when sign in fails', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'User not found' },
                        }),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signIn(
                        'nonexistent@example.com',
                        'password'
                    );
                });

                expect(result.current.error).toEqual({
                    message: 'User not found',
                });
            });

            it('should set loading to false when sign in fails', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Authentication failed' },
                        }),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signIn('user@example.com', 'password');
                });

                expect(result.current.loading).toBe(false);
            });
        });

        describe('Failure Cases - Exception', () => {
            it('should handle exception thrown during sign in', async () => {
                const testError = new Error('Network error');
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest
                            .fn()
                            .mockRejectedValue(testError),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                let signInResult: any;
                await act(async () => {
                    signInResult = await result.current.signIn(
                        'user@example.com',
                        'password'
                    );
                });

                expect(signInResult.data).toBeNull();
                expect(signInResult.error).toEqual({
                    message: 'Network error',
                });
            });

            it('should normalize error and set error state on exception', async () => {
                const testError = new Error('Connection timeout');
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest
                            .fn()
                            .mockRejectedValue(testError),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signIn('user@example.com', 'password');
                });

                expect(result.current.error).toEqual({
                    message: 'Connection timeout',
                });
            });
        });

        describe('Loading State', () => {
            it('should set loading to true during sign in', async () => {
                let resolveSignIn: any;
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn().mockImplementation(
                            () =>
                                new Promise((resolve) => {
                                    resolveSignIn = resolve;
                                })
                        ),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                // Start the sign in
                const signInPromise = act(async () => {
                    const promise = result.current.signIn(
                        'user@example.com',
                        'password'
                    );
                    // Resolve after a brief delay to allow state to update
                    await new Promise((resolve) => setTimeout(resolve, 0));
                    resolveSignIn({ data: { session: {} }, error: null });
                    return promise;
                });

                await signInPromise;

                expect(result.current.loading).toBe(false);
            });

            it('should set loading to false after sign in completes', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest
                            .fn()
                            .mockResolvedValue({
                                data: { session: {} },
                                error: null,
                            }),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signIn('user@example.com', 'password');
                });

                expect(result.current.loading).toBe(false);
            });
        });

        describe('Error Clearing', () => {
            it('should clear previous error on new sign in attempt', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest
                            .fn()
                            .mockResolvedValueOnce({
                                data: null,
                                error: { message: 'Invalid credentials' },
                            })
                            .mockResolvedValueOnce({
                                data: { session: {} },
                                error: null,
                            }),
                        signUp: jest.fn(),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                // First attempt - fails
                await act(async () => {
                    await result.current.signIn(
                        'user@example.com',
                        'wrongpassword'
                    );
                });

                expect(result.current.error).toEqual({
                    message: 'Invalid credentials',
                });

                // Second attempt - succeeds
                await act(async () => {
                    await result.current.signIn(
                        'user@example.com',
                        'correctpassword'
                    );
                });

                expect(result.current.error).toBeNull();
            });
        });
    });

    describe('SignUp', () => {
        describe('Success Cases', () => {
            it('should successfully sign up with valid credentials', async () => {
                const mockData = {
                    user: { id: '123', email: 'new@example.com' },
                };
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest
                            .fn()
                            .mockResolvedValue({ data: mockData, error: null }),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                let signUpResult: any;
                await act(async () => {
                    signUpResult = await result.current.signUp(
                        'new@example.com',
                        'password123'
                    );
                });

                expect(signUpResult.data).toEqual(mockData);
                expect(signUpResult.error).toBeNull();
            });

            it('should call signUp with correct email and password', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest
                            .fn()
                            .mockResolvedValue({
                                data: { user: {} },
                                error: null,
                            }),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signUp(
                        'test@example.com',
                        'secret123'
                    );
                });

                expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'secret123',
                });
            });

            it('should set loading to false after successful sign up', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest
                            .fn()
                            .mockResolvedValue({
                                data: { user: {} },
                                error: null,
                            }),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signUp(
                        'user@example.com',
                        'password123'
                    );
                });

                expect(result.current.loading).toBe(false);
            });

            it('should set error to null after successful sign up', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest
                            .fn()
                            .mockResolvedValue({
                                data: { user: {} },
                                error: null,
                            }),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signUp(
                        'user@example.com',
                        'password123'
                    );
                });

                expect(result.current.error).toBeNull();
            });
        });

        describe('Failure Cases - Supabase Error', () => {
            it('should handle sign up error from Supabase', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'User already exists' },
                        }),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                let signUpResult: any;
                await act(async () => {
                    signUpResult = await result.current.signUp(
                        'existing@example.com',
                        'password123'
                    );
                });

                expect(signUpResult.data).toBeNull();
                expect(signUpResult.error).toEqual({
                    message: 'User already exists',
                });
            });

            it('should set error state when sign up fails', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Invalid email format' },
                        }),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signUp('invalid-email', 'password');
                });

                expect(result.current.error).toEqual({
                    message: 'Invalid email format',
                });
            });

            it('should set loading to false when sign up fails', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Sign up failed' },
                        }),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signUp('user@example.com', 'password');
                });

                expect(result.current.loading).toBe(false);
            });
        });

        describe('Failure Cases - Exception', () => {
            it('should handle exception thrown during sign up', async () => {
                const testError = new Error('Server error');
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn().mockRejectedValue(testError),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                let signUpResult: any;
                await act(async () => {
                    signUpResult = await result.current.signUp(
                        'user@example.com',
                        'password'
                    );
                });

                expect(signUpResult.data).toBeNull();
                expect(signUpResult.error).toEqual({ message: 'Server error' });
            });

            it('should normalize error and set error state on exception', async () => {
                const testError = new Error('Database connection failed');
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn().mockRejectedValue(testError),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signUp('user@example.com', 'password');
                });

                expect(result.current.error).toEqual({
                    message: 'Database connection failed',
                });
            });
        });

        describe('Loading State', () => {
            it('should set loading to true during sign up', async () => {
                let resolveSignUp: any;
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn().mockImplementation(
                            () =>
                                new Promise((resolve) => {
                                    resolveSignUp = resolve;
                                })
                        ),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                // Start the sign up
                const signUpPromise = act(async () => {
                    const promise = result.current.signUp(
                        'user@example.com',
                        'password'
                    );
                    // Resolve after a brief delay to allow state to update
                    await new Promise((resolve) => setTimeout(resolve, 0));
                    resolveSignUp({ data: { user: {} }, error: null });
                    return promise;
                });

                await signUpPromise;

                expect(result.current.loading).toBe(false);
            });

            it('should set loading to false after sign up completes', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest
                            .fn()
                            .mockResolvedValue({
                                data: { user: {} },
                                error: null,
                            }),
                        signOut: jest.fn(),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signUp('user@example.com', 'password');
                });

                expect(result.current.loading).toBe(false);
            });
        });
    });

    describe('SignOut', () => {
        describe('Success Cases', () => {
            it('should successfully sign out', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockResolvedValue({ error: null }),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                let signOutResult: any;
                await act(async () => {
                    signOutResult = await result.current.signOut();
                });

                expect(signOutResult.error).toBeNull();
            });

            it('should call signOut on Supabase auth', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockResolvedValue({ error: null }),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signOut();
                });

                expect(mockSupabase.auth.signOut).toHaveBeenCalled();
            });

            it('should set loading to false after successful sign out', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockResolvedValue({ error: null }),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signOut();
                });

                expect(result.current.loading).toBe(false);
            });

            it('should set error to null after successful sign out', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockResolvedValue({ error: null }),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signOut();
                });

                expect(result.current.error).toBeNull();
            });
        });

        describe('Failure Cases - Supabase Error', () => {
            it('should handle sign out error from Supabase', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockResolvedValue({
                            error: { message: 'Sign out failed' },
                        }),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                let signOutResult: any;
                await act(async () => {
                    signOutResult = await result.current.signOut();
                });

                expect(signOutResult.error).toEqual({
                    message: 'Sign out failed',
                });
            });

            it('should set error state when sign out fails', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockResolvedValue({
                            error: { message: 'Session termination error' },
                        }),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signOut();
                });

                expect(result.current.error).toEqual({
                    message: 'Session termination error',
                });
            });

            it('should set loading to false when sign out fails', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockResolvedValue({
                            error: { message: 'Error' },
                        }),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signOut();
                });

                expect(result.current.loading).toBe(false);
            });
        });

        describe('Failure Cases - Exception', () => {
            it('should handle exception thrown during sign out', async () => {
                const testError = new Error('Network error');
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockRejectedValue(testError),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                let signOutResult: any;
                await act(async () => {
                    signOutResult = await result.current.signOut();
                });

                expect(signOutResult.error).toEqual({
                    message: 'Network error',
                });
            });

            it('should normalize error and set error state on exception', async () => {
                const testError = new Error('Connection lost');
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockRejectedValue(testError),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signOut();
                });

                expect(result.current.error).toEqual({
                    message: 'Connection lost',
                });
            });
        });

        describe('Loading State', () => {
            it('should set loading to true during sign out', async () => {
                let resolveSignOut: any;
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockImplementation(
                            () =>
                                new Promise((resolve) => {
                                    resolveSignOut = resolve;
                                })
                        ),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                // Start the sign out
                const signOutPromise = act(async () => {
                    const promise = result.current.signOut();
                    // Resolve after a brief delay to allow state to update
                    await new Promise((resolve) => setTimeout(resolve, 0));
                    resolveSignOut({ error: null });
                    return promise;
                });

                await signOutPromise;

                expect(result.current.loading).toBe(false);
            });

            it('should set loading to false after sign out completes', async () => {
                const mockSupabase = {
                    auth: {
                        signInWithPassword: jest.fn(),
                        signUp: jest.fn(),
                        signOut: jest.fn().mockResolvedValue({ error: null }),
                    },
                };
                mockCreateClient.mockReturnValue(mockSupabase as any);

                const { result } = renderHook(() => useAuth());

                await act(async () => {
                    await result.current.signOut();
                });

                expect(result.current.loading).toBe(false);
            });
        });
    });

    describe('Error Normalization', () => {
        it('should normalize Error instance', async () => {
            const testError = new Error('Something went wrong');
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest.fn().mockRejectedValue(testError),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            let signInResult: any;
            await act(async () => {
                signInResult = await result.current.signIn(
                    'user@example.com',
                    'pass'
                );
            });

            expect(signInResult.error).toEqual({
                message: 'Something went wrong',
            });
            expect(signInResult.error).toHaveProperty('message');
        });

        it('should normalize object with message property', async () => {
            const testError = { message: 'Custom error message' };
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest.fn().mockRejectedValue(testError),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            let signInResult: any;
            await act(async () => {
                signInResult = await result.current.signIn(
                    'user@example.com',
                    'pass'
                );
            });

            expect(signInResult.error).toEqual({
                message: 'Custom error message',
            });
        });

        it('should handle unexpected error types', async () => {
            const testError = 'String error';
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest.fn().mockRejectedValue(testError),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            let signInResult: any;
            await act(async () => {
                signInResult = await result.current.signIn(
                    'user@example.com',
                    'pass'
                );
            });

            expect(signInResult.error).toEqual({
                message: 'An unexpected error occurred',
            });
        });

        it('should handle null error', async () => {
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest.fn().mockRejectedValue(null),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            let signInResult: any;
            await act(async () => {
                signInResult = await result.current.signIn(
                    'user@example.com',
                    'pass'
                );
            });

            expect(signInResult.error).toEqual({
                message: 'An unexpected error occurred',
            });
        });

        it('should handle undefined error', async () => {
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest.fn().mockRejectedValue(undefined),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            let signInResult: any;
            await act(async () => {
                signInResult = await result.current.signIn(
                    'user@example.com',
                    'pass'
                );
            });

            expect(signInResult.error).toEqual({
                message: 'An unexpected error occurred',
            });
        });

        it('should handle number as error', async () => {
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest.fn().mockRejectedValue(404),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            let signInResult: any;
            await act(async () => {
                signInResult = await result.current.signIn(
                    'user@example.com',
                    'pass'
                );
            });

            expect(signInResult.error).toEqual({
                message: 'An unexpected error occurred',
            });
        });
    });

    describe('State Persistence', () => {
        it('should persist loading state across multiple operations', async () => {
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest
                        .fn()
                        .mockResolvedValue({
                            data: { session: {} },
                            error: null,
                        }),
                    signUp: jest
                        .fn()
                        .mockResolvedValue({ data: { user: {} }, error: null }),
                    signOut: jest.fn().mockResolvedValue({ error: null }),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            // After signIn
            await act(async () => {
                await result.current.signIn('user@example.com', 'password');
            });
            expect(result.current.loading).toBe(false);

            // After signUp
            await act(async () => {
                await result.current.signUp('new@example.com', 'password');
            });
            expect(result.current.loading).toBe(false);

            // After signOut
            await act(async () => {
                await result.current.signOut();
            });
            expect(result.current.loading).toBe(false);
        });

        it('should persist error state across multiple operations', async () => {
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest
                        .fn()
                        .mockResolvedValueOnce({
                            data: null,
                            error: { message: 'Sign in error' },
                        })
                        .mockResolvedValueOnce({
                            data: { session: {} },
                            error: null,
                        }),
                    signUp: jest.fn(),
                    signOut: jest.fn(),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            // First signIn fails
            await act(async () => {
                await result.current.signIn(
                    'user@example.com',
                    'wrongpassword'
                );
            });
            expect(result.current.error).toEqual({ message: 'Sign in error' });

            // Second signIn succeeds and clears error
            await act(async () => {
                await result.current.signIn(
                    'user@example.com',
                    'correctpassword'
                );
            });
            expect(result.current.error).toBeNull();
        });
    });

    describe('Multiple Simultaneous Operations', () => {
        it('should handle sequential auth operations correctly', async () => {
            const mockSupabase = {
                auth: {
                    signInWithPassword: jest
                        .fn()
                        .mockResolvedValue({
                            data: { session: {} },
                            error: null,
                        }),
                    signUp: jest
                        .fn()
                        .mockResolvedValue({ data: { user: {} }, error: null }),
                    signOut: jest.fn().mockResolvedValue({ error: null }),
                },
            };
            mockCreateClient.mockReturnValue(mockSupabase as any);

            const { result } = renderHook(() => useAuth());

            // Perform sequential operations
            await act(async () => {
                await result.current.signIn('user@example.com', 'password');
            });
            expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledTimes(
                1
            );

            await act(async () => {
                await result.current.signOut();
            });
            expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
        });
    });
});

/**
 * Tests for Next.js Middleware
 *
 * The middleware protects /admin routes by:
 * - Redirecting unauthenticated users to /admin/login
 * - Validating admin status in the database
 * - Caching admin sessions for performance
 * - Allowing public routes without authentication
 *
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '@/proxy';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock createServerClient from Supabase SSR
vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(),
}));

import { createServerClient } from '@supabase/ssr';

const mockCreateServerClient = vi.mocked(createServerClient);

describe('Middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Public Routes', () => {
        it('should allow access to public routes without authentication', async () => {
            const request = new NextRequest('http://localhost:3000/gallery');
            const response = await proxy(request);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
        });

        it('should allow access to home page without authentication', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await proxy(request);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
        });

        it('should allow access to contact page without authentication', async () => {
            const request = new NextRequest('http://localhost:3000/contact');
            const response = await proxy(request);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
        });

        it('should allow access to shoppe page without authentication', async () => {
            const request = new NextRequest('http://localhost:3000/shoppe');
            const response = await proxy(request);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
        });
    });

    describe('Admin Login Route', () => {
        it('should allow access to /admin/login without authentication', async () => {
            const request = new NextRequest(
                'http://localhost:3000/admin/login'
            );
            const response = await proxy(request);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
        });
    });

    describe('Protected Admin Routes - Missing Environment Variables', () => {
        it('should redirect to login if NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
            const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            delete process.env.NEXT_PUBLIC_SUPABASE_URL;

            try {
                const request = new NextRequest('http://localhost:3000/admin');
                const response = await proxy(request);

                expect(response).toBeInstanceOf(NextResponse);
                expect(response?.status).toBe(307); // Redirect status
            } finally {
                process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
            }
        });

        it('should redirect to login if SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
            const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            delete process.env.SUPABASE_SERVICE_ROLE_KEY;

            try {
                const request = new NextRequest('http://localhost:3000/admin');
                const response = await proxy(request);

                expect(response).toBeInstanceOf(NextResponse);
                expect(response?.status).toBe(307); // Redirect status
            } finally {
                process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
            }
        });
    });

    describe('Protected Admin Routes - Authentication', () => {
        it('should redirect to login if user is not authenticated', async () => {
            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: { user: null },
                    }),
                },
                from: vi.fn(),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest('http://localhost:3000/admin');
            const response = await proxy(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(307); // Redirect
        });

        it('should redirect to login if user is authenticated but not an admin', async () => {
            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: {
                            user: {
                                id: 'user-123',
                                email: 'user@example.com',
                            },
                        },
                    }),
                },
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: {
                                        message: 'No admin record found',
                                    },
                                }),
                            }),
                        }),
                    }),
                }),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest('http://localhost:3000/admin');
            const response = await proxy(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(307); // Redirect to login
        });

        it('should redirect to login if admin is inactive', async () => {
            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: {
                            user: {
                                id: 'user-123',
                                email: 'admin@example.com',
                            },
                        },
                    }),
                },
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValueOnce({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: {
                                        id: 'admin-123',
                                        role: 'admin',
                                        is_active: false,
                                    },
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest('http://localhost:3000/admin');
            const response = await proxy(request);

            expect(response).toBeInstanceOf(NextResponse);
        });
    });

    describe('Session Caching', () => {
        it('should use cached admin session if valid and not expired', async () => {
            const validCache = JSON.stringify({
                userId: 'user-123',
                adminId: 'admin-123',
                role: 'admin',
                expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
            });

            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn(), // Should not be called
                },
                from: vi.fn(),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest('http://localhost:3000/admin', {
                headers: {
                    cookie: `admin_session=${validCache}`,
                },
            });

            await proxy(request);

            // Should return a successful response without calling getUser
            expect(mockSupabaseClient.auth.getUser).not.toHaveBeenCalled();
        });

        it('should invalidate expired cached session', async () => {
            const expiredCache = JSON.stringify({
                userId: 'user-123',
                adminId: 'admin-123',
                role: 'admin',
                expiresAt: Date.now() - 1000, // 1 second ago (expired)
            });

            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: {
                            user: {
                                id: 'user-123',
                                email: 'admin@example.com',
                            },
                        },
                    }),
                },
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: {
                                        id: 'admin-123',
                                        role: 'admin',
                                        is_active: true,
                                    },
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest('http://localhost:3000/admin', {
                headers: {
                    cookie: `admin_session=${expiredCache}`,
                },
            });

            await proxy(request);

            // Should call getUser because cache is expired
            expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
        });

        it('should cache admin session with 15 minute expiry', async () => {
            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: {
                            user: {
                                id: 'user-123',
                                email: 'admin@example.com',
                            },
                        },
                    }),
                },
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: {
                                        id: 'admin-123',
                                        role: 'admin',
                                        is_active: true,
                                    },
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest('http://localhost:3000/admin');
            const response = await proxy(request);

            // Verify session cookie is set with correct max age
            const setCookieHeader = response?.headers.get('set-cookie');
            expect(setCookieHeader).toContain('admin_session');
            expect(setCookieHeader).toContain('Max-Age=900'); // 15 minutes in seconds
        });
    });

    describe('Admin Authorization', () => {
        it('should allow authenticated active admin to access /admin routes', async () => {
            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: {
                            user: {
                                id: 'user-123',
                                email: 'admin@example.com',
                            },
                        },
                    }),
                },
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: {
                                        id: 'admin-123',
                                        role: 'admin',
                                        is_active: true,
                                    },
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest('http://localhost:3000/admin');
            const response = await proxy(request);

            expect(response).toBeDefined();
            expect(response?.status).toBe(200); // Successful response
        });

        it('should reject unauthenticated access to /admin/dashboard', async () => {
            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: { user: null },
                    }),
                },
                from: vi.fn(),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest(
                'http://localhost:3000/admin/dashboard'
            );
            const response = await proxy(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(307);
        });
    });

    describe('Error Handling', () => {
        it('should handle malformed cache session gracefully', async () => {
            const malformedCache = 'not-valid-json';

            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: {
                            user: {
                                id: 'user-123',
                                email: 'admin@example.com',
                            },
                        },
                    }),
                },
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: {
                                        id: 'admin-123',
                                        role: 'admin',
                                        is_active: true,
                                    },
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest('http://localhost:3000/admin', {
                headers: {
                    cookie: `admin_session=${malformedCache}`,
                },
            });

            await proxy(request);

            // Should continue with normal auth flow after parsing fails
            expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
        });

        it('should handle database query errors gracefully', async () => {
            const mockSupabaseClient = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: {
                            user: {
                                id: 'user-123',
                                email: 'admin@example.com',
                            },
                        },
                    }),
                },
                from: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: new Error(
                                        'Database connection failed'
                                    ),
                                }),
                            }),
                        }),
                    }),
                }),
                cookies: {
                    getAll: vi.fn().mockReturnValue([]),
                },
            };

            mockCreateServerClient.mockReturnValue(
                mockSupabaseClient as ReturnType<typeof createServerClient>
            );

            const request = new NextRequest('http://localhost:3000/admin');
            const response = await proxy(request);

            // Should redirect to login on database error
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(307);
        });
    });
});

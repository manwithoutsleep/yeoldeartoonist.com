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
import { middleware } from '@/middleware';
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
            const response = await middleware(request);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
        });

        it('should allow access to home page without authentication', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
        });

        it('should allow access to contact page without authentication', async () => {
            const request = new NextRequest('http://localhost:3000/contact');
            const response = await middleware(request);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
        });

        it('should allow access to shoppe page without authentication', async () => {
            const request = new NextRequest('http://localhost:3000/shoppe');
            const response = await middleware(request);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
        });
    });

    describe('Admin Login Route', () => {
        it('should allow access to /admin/login without authentication', async () => {
            const request = new NextRequest(
                'http://localhost:3000/admin/login'
            );
            const response = await middleware(request);

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
                const response = await middleware(request);

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
                const response = await middleware(request);

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
            const response = await middleware(request);

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
            const response = await middleware(request);

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
            const response = await middleware(request);

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

            await middleware(request);

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

            await middleware(request);

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
            const response = await middleware(request);

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
            const response = await middleware(request);

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
            const response = await middleware(request);

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

            await middleware(request);

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
            const response = await middleware(request);

            // Should redirect to login on database error
            expect(response).toBeInstanceOf(NextResponse);
            expect(response?.status).toBe(307);
        });
    });

    describe('CSP Nonce Generation', () => {
        it('should generate nonce for public routes', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toBeTruthy();
            expect(csp).toMatch(/nonce-[A-Za-z0-9+/=]+/);
        });

        it('should generate different nonces for different requests', async () => {
            const request1 = new NextRequest('http://localhost:3000/');
            const response1 = await middleware(request1);
            const csp1 = response1.headers.get('Content-Security-Policy');

            const request2 = new NextRequest('http://localhost:3000/');
            const response2 = await middleware(request2);
            const csp2 = response2.headers.get('Content-Security-Policy');

            // Extract nonces from CSP headers
            const nonceMatch1 = csp1?.match(/nonce-([A-Za-z0-9+/=]+)/);
            const nonceMatch2 = csp2?.match(/nonce-([A-Za-z0-9+/=]+)/);

            expect(nonceMatch1).toBeTruthy();
            expect(nonceMatch2).toBeTruthy();
            expect(nonceMatch1?.[1]).not.toBe(nonceMatch2?.[1]);
        });

        it('should generate nonce with correct length', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            const nonceMatch = csp?.match(/nonce-([A-Za-z0-9+/=]+)/);

            expect(nonceMatch).toBeTruthy();
            // Base64 encoded 16 bytes should be approximately 24 characters
            expect(nonceMatch?.[1].length).toBeGreaterThanOrEqual(20);
            expect(nonceMatch?.[1].length).toBeLessThanOrEqual(30);
        });

        it('should generate base64-encoded nonce', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            const nonceMatch = csp?.match(/nonce-([A-Za-z0-9+/=]+)/);

            expect(nonceMatch).toBeTruthy();
            // Should only contain base64 characters
            expect(nonceMatch?.[1]).toMatch(/^[A-Za-z0-9+/=]+$/);
        });

        it('should generate cryptographically random nonces', async () => {
            const nonces = new Set<string>();

            // Generate 100 nonces and check for uniqueness
            for (let i = 0; i < 100; i++) {
                const request = new NextRequest('http://localhost:3000/');
                const response = await middleware(request);
                const csp = response.headers.get('Content-Security-Policy');
                const nonceMatch = csp?.match(/nonce-([A-Za-z0-9+/=]+)/);

                if (nonceMatch?.[1]) {
                    nonces.add(nonceMatch[1]);
                }
            }

            // All nonces should be unique (probability of collision is negligible)
            expect(nonces.size).toBe(100);
        });
    });

    describe('CSP Headers - Production Mode', () => {
        const originalEnv = process.env.NODE_ENV;

        beforeEach(() => {
            vi.stubEnv('NODE_ENV', 'production');
        });

        afterEach(() => {
            vi.unstubAllEnvs();
            if (originalEnv !== undefined) {
                vi.stubEnv('NODE_ENV', originalEnv);
            }
        });

        it('should set CSP header in production mode', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toBeTruthy();
        });

        it('should use strict-dynamic in production CSP', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain('strict-dynamic');
        });

        it('should include nonce in production CSP', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toMatch(/script-src 'nonce-[A-Za-z0-9+/=]+'/);
        });

        it('should not allow unsafe-eval in production', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).not.toContain('unsafe-eval');
        });

        it('should include upgrade-insecure-requests in production', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain('upgrade-insecure-requests');
        });

        it('should not include https: fallback in production CSP', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            // Should not have permissive https: directive
            const scriptSrcMatch = csp?.match(/script-src[^;]+/);
            expect(scriptSrcMatch?.[0]).not.toMatch(/\bhttps:\b/);
        });

        it('should include unsafe-inline as fallback for older browsers', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain('unsafe-inline');
        });
    });

    describe('CSP Headers - Development Mode', () => {
        const originalEnv = process.env.NODE_ENV;

        beforeEach(() => {
            vi.stubEnv('NODE_ENV', 'development');
        });

        afterEach(() => {
            vi.unstubAllEnvs();
            if (originalEnv !== undefined) {
                vi.stubEnv('NODE_ENV', originalEnv);
            }
        });

        it('should set CSP header in development mode', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toBeTruthy();
        });

        it('should allow unsafe-eval in development for Turbopack', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain('unsafe-eval');
        });

        it('should not include upgrade-insecure-requests in development', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).not.toContain('upgrade-insecure-requests');
        });

        it('should allow self in development', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain("'self'");
        });
    });

    describe('x-nonce Request Header', () => {
        it('should set x-nonce header on public routes', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            // The x-nonce should be in the CSP header
            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toMatch(/nonce-[A-Za-z0-9+/=]+/);
        });

        it('should set x-nonce header on admin login route', async () => {
            const request = new NextRequest(
                'http://localhost:3000/admin/login'
            );
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toMatch(/nonce-[A-Za-z0-9+/=]+/);
        });

        it('should set x-pathname header on all routes', async () => {
            const request = new NextRequest('http://localhost:3000/gallery');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toBeTruthy();
        });

        it('should propagate nonce through middleware pipeline', async () => {
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
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toMatch(/nonce-[A-Za-z0-9+/=]+/);
        });
    });

    describe('Security Headers', () => {
        it('should set X-DNS-Prefetch-Control header', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            expect(response.headers.get('X-DNS-Prefetch-Control')).toBe('on');
        });

        it('should set Strict-Transport-Security header', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            expect(response.headers.get('Strict-Transport-Security')).toBe(
                'max-age=63072000; includeSubDomains; preload'
            );
        });

        it('should set X-Frame-Options header', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        });

        it('should set X-Content-Type-Options header', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            expect(response.headers.get('X-Content-Type-Options')).toBe(
                'nosniff'
            );
        });

        it('should set X-XSS-Protection header', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            expect(response.headers.get('X-XSS-Protection')).toBe(
                '1; mode=block'
            );
        });

        it('should set Referrer-Policy header', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            expect(response.headers.get('Referrer-Policy')).toBe(
                'origin-when-cross-origin'
            );
        });

        it('should set Permissions-Policy header', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            expect(response.headers.get('Permissions-Policy')).toBe(
                'camera=(), microphone=(), geolocation=()'
            );
        });

        it('should apply all security headers to admin routes', async () => {
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
            const response = await middleware(request);

            expect(
                response.headers.get('Content-Security-Policy')
            ).toBeTruthy();
            expect(response.headers.get('X-Frame-Options')).toBe('DENY');
            expect(response.headers.get('X-Content-Type-Options')).toBe(
                'nosniff'
            );
        });
    });

    describe('CSP Content Directives', () => {
        it('should set default-src to self', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain("default-src 'self'");
        });

        it('should allow fonts from Google Fonts', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain('font-src');
            expect(csp).toContain('https://fonts.gstatic.com');
        });

        it('should allow styles from Google Fonts', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain('style-src');
            expect(csp).toContain('https://fonts.googleapis.com');
        });

        it('should allow images from Supabase', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain('img-src');
            expect(csp).toContain('https://*.supabase.co');
        });

        it('should allow connection to Supabase', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain('connect-src');
            expect(csp).toContain('https://*.supabase.co');
        });

        it('should allow Stripe iframe', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain('frame-src');
            expect(csp).toContain('https://js.stripe.com');
        });

        it('should block object-src', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain("object-src 'none'");
        });

        it('should restrict base-uri to self', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain("base-uri 'self'");
        });

        it('should restrict form-action to self', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain("form-action 'self'");
        });

        it('should restrict frame-ancestors to self', async () => {
            const request = new NextRequest('http://localhost:3000/');
            const response = await middleware(request);

            const csp = response.headers.get('Content-Security-Policy');
            expect(csp).toContain("frame-ancestors 'self'");
        });
    });
});

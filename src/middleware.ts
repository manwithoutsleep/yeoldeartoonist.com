/**
 * Next.js Middleware
 *
 * This middleware handles authentication checks for protected routes,
 * particularly the /admin routes. It ensures that only authenticated
 * admin users can access the admin panel.
 *
 * IMPORTANT: In Next.js 16, this should be named proxy.ts, but there's a known
 * bug on Windows where proxy.ts doesn't work. We use middleware.ts as a workaround.
 * See: https://github.com/vercel/next.js/issues/85243
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export async function middleware(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Only protect admin routes (but allow login without auth)
    if (!pathname.startsWith('/admin')) {
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }

    // Allow login page without authentication
    if (pathname === '/admin/login') {
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        if (isDevelopment) {
            console.error('Missing NEXT_PUBLIC_SUPABASE_URL in middleware');
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (isDevelopment) {
            console.error(
                'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in middleware'
            );
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        if (isDevelopment) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY in middleware');
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Create response object for cookie handling
    const supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Check if user has a cached admin session in cookies
    // This optimization avoids repeated database queries for every request
    const cachedAdminSession = request.cookies.get('admin_session')?.value;

    if (cachedAdminSession) {
        try {
            // Verify the cached session is still valid
            const sessionData = JSON.parse(cachedAdminSession);
            if (
                sessionData &&
                sessionData.userId &&
                sessionData.expiresAt > Date.now()
            ) {
                return supabaseResponse;
            }
        } catch {
            // If cache parsing fails, continue with normal auth flow
            if (isDevelopment) {
                console.warn('Failed to parse cached admin session');
            }
        }
    }

    // Create a client for auth operations (uses anon key to avoid contamination)
    const authClient = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Check if user is authenticated using auth client
    const {
        data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
        // User is not authenticated, redirect to login
        if (isDevelopment) {
            console.log('[MIDDLEWARE] No authenticated user found');
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (isDevelopment) {
        console.log('[MIDDLEWARE] Authenticated user:', user.id);
    }

    // Create a separate service role client for admin queries
    // IMPORTANT: Don't mix auth operations with this client to avoid session contamination
    const adminClient = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Check if user is an active administrator using service role client
    // Service role bypasses RLS, avoiding infinite recursion
    const { data: admin, error: adminError } = await adminClient
        .from('administrators')
        .select('id, name, role, is_active')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (isDevelopment) {
        console.log('[MIDDLEWARE] Admin lookup result:', {
            found: !!admin,
            error: adminError?.message,
            errorDetails: adminError,
            userId: user.id,
            adminData: admin,
        });
    }

    if (adminError || !admin) {
        // User is not an admin or is inactive, redirect to login
        if (isDevelopment) {
            console.log('[MIDDLEWARE] Admin not found or error:', adminError);
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Cache the admin session for 15 minutes to reduce database queries
    const cacheExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    const sessionCache = JSON.stringify({
        userId: user.id,
        adminId: admin.id,
        name: admin.name,
        role: admin.role,
        expiresAt: cacheExpiry,
    });

    supabaseResponse.cookies.set('admin_session', sessionCache, {
        httpOnly: false, // Allows JavaScript to check if user is admin
        secure: !isDevelopment, // HTTPS in production
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
    });

    return supabaseResponse;
}

// Specify which routes should be checked by middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * But DO match /admin routes
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

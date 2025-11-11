/**
 * Next.js Middleware
 *
 * This middleware handles authentication checks for protected routes,
 * particularly the /admin routes. It ensures that only authenticated
 * admin users can access the admin panel.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export async function proxy(request: NextRequest) {
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

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        if (isDevelopment) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY in middleware');
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Create a Supabase client with the service role key for admin operations
    // This ensures RLS policies are properly enforced during authentication checks
    const supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient<Database>(
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

    // Check if user is authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // User is not authenticated, redirect to login
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user is an active administrator using service role access
    const { data: admin, error: adminError } = await supabase
        .from('administrators')
        .select('id, role, is_active')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminError || !admin) {
        // User is not an admin or is inactive, redirect to login
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Cache the admin session for 15 minutes to reduce database queries
    const cacheExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    const sessionCache = JSON.stringify({
        userId: user.id,
        adminId: admin.id,
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

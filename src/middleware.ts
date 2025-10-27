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

export async function middleware(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname;

    // Only protect admin routes (but allow login and signup without auth)
    if (!pathname.startsWith('/admin')) {
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }

    // Allow login and signup pages without authentication
    if (pathname === '/admin/login' || pathname === '/admin/signup') {
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }

    // Create a Supabase client with the cookies from the request
    const supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
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

    // Check if user is authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // User is not authenticated, redirect to login
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user is an active administrator
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

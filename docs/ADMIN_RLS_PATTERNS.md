# Supabase Admin User Management: RLS Best Practices

**Date:** 2025-11-13
**Status:** Research Summary
**Context:** Phase 3 Admin System Implementation

---

## Executive Summary

This document summarizes recommended patterns for implementing admin-only access in a Supabase application with Row Level Security (RLS), based on official Supabase documentation and community best practices.

**Key Finding:** There are three primary approaches to admin user management in Supabase, each with distinct trade-offs. The recommended approach depends on your security model and operational requirements.

---

## The Core Problem

When implementing admin user management with an `administrators` table, you encounter a circular dependency:

1. RLS policies on the `administrators` table need to check if the user is an admin
2. Checking if a user is an admin requires querying the `administrators` table
3. Querying the `administrators` table triggers RLS policies
4. This creates infinite recursion (PostgreSQL error 54001: stack depth exceeded)

Example of problematic RLS policy:

```sql
CREATE POLICY "Admins can view all administrators"
    ON administrators FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM administrators  -- This query triggers the policy we're defining!
            WHERE auth_id = auth.uid() AND is_active = true
        )
    );
```

---

## Three Recommended Approaches

### Approach 1: Service Role Client (Current Implementation)

**Pattern:** Use service role key in middleware/API routes, disable RLS on administrators table OR use minimal RLS.

**Implementation:**

```sql
-- Option A: Disable RLS entirely
ALTER TABLE administrators DISABLE ROW LEVEL SECURITY;

-- Option B: Minimal RLS for defense-in-depth
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own admin record only
CREATE POLICY "Users can read own admin record"
    ON administrators FOR SELECT
    TO authenticated
    USING (auth_id = auth.uid());

-- No INSERT, UPDATE, DELETE policies for authenticated role
-- Service role bypasses RLS, so these restrictions don't apply to admin operations
```

**Server-side code (middleware):**

```typescript
// Create Supabase client with service role key
const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Service role bypasses RLS
    {
        cookies: {
            /* ... */
        },
    }
);

// Query administrators table - bypasses all RLS policies
const { data: admin } = await supabase
    .from('administrators')
    .select('*')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single();
```

**Pros:**

- Simple and straightforward
- No circular dependency issues
- Service role automatically bypasses all RLS
- Best for middleware/server-side operations
- No performance overhead

**Cons:**

- Removes defense-in-depth on administrators table
- Service role key must be kept extremely secure
- Can't use with client-side queries (would expose service role key)

**Security Notes:**

- Service role key MUST NEVER be exposed to the client
- Service role key bypasses ALL RLS policies on ALL tables
- Only use in server-side code (middleware, API routes, server components)

**Best For:**

- Next.js middleware authentication checks
- Server-side API routes
- Applications where all admin operations are server-side

**Current Status:** This is the approach currently implemented in the codebase.

---

### Approach 2: SECURITY DEFINER Function (Recommended by PostgreSQL Experts)

**Pattern:** Create a PostgreSQL function with `SECURITY DEFINER` that bypasses RLS for internal queries, then use that function in RLS policies.

**Implementation:**

```sql
-- 1. Enable RLS on administrators table
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- 2. Create a SECURITY DEFINER function
-- This function executes with the privileges of the function's creator,
-- bypassing RLS for the internal query
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM administrators
        WHERE auth_id = auth.uid()
        AND is_active = true
    );
END;
$$;

-- 3. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 4. Use the function in RLS policies on OTHER tables
CREATE POLICY "Admins can manage all artwork"
    ON artwork FOR ALL
    TO authenticated
    USING (
        (SELECT is_admin())  -- Wrap in SELECT for query plan optimization
    );

-- 5. For the administrators table itself, use simple policies
CREATE POLICY "Users can read own admin record"
    ON administrators FOR SELECT
    TO authenticated
    USING (auth_id = auth.uid());

CREATE POLICY "Admins can read all admin records"
    ON administrators FOR SELECT
    TO authenticated
    USING ((SELECT is_admin()));
```

**Pros:**

- Breaks the circular dependency cleanly
- Allows proper RLS on administrators table
- Can be used with anon key (client-side and server-side)
- Defense-in-depth security model
- Standard PostgreSQL security pattern

**Cons:**

- Functions can be called from the API (security consideration)
- Requires understanding of PostgreSQL function security
- Slightly more complex setup

**Performance Optimization:**
Wrapping the function in `SELECT` creates an initPlan that caches the result:

```sql
USING ((SELECT is_admin()))  -- Called once, result cached for the query
vs.
USING (is_admin())  -- Potentially called for each row
```

**Security Considerations:**

- `SECURITY DEFINER` functions execute with the privileges of the function's creator
- Set `search_path = public` to prevent search path attacks
- Functions can be called from Supabase client API, so don't expose sensitive operations
- Use `GRANT EXECUTE` to explicitly control who can call the function

**Best For:**

- Applications needing client-side admin checks
- Multi-tenant applications
- Complex permission systems
- When you want proper RLS on all tables including administrators

---

### Approach 3: Custom Claims via Auth Hooks (Most Scalable)

**Pattern:** Use Supabase Auth Hooks to add admin role to JWT tokens, avoiding database queries for permission checks.

**Implementation:**

**1. Create the auth hook function:**

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    claims jsonb;
    user_role text;
    is_admin_user boolean;
BEGIN
    -- Extract current claims from event
    claims := event->'claims';

    -- Check if user is an active admin
    SELECT EXISTS (
        SELECT 1 FROM administrators
        WHERE auth_id = (event->>'user_id')::uuid
        AND is_active = true
    ) INTO is_admin_user;

    -- Get user role
    IF is_admin_user THEN
        SELECT role INTO user_role
        FROM administrators
        WHERE auth_id = (event->>'user_id')::uuid;

        -- Add custom claims to JWT
        claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
        claims := jsonb_set(claims, '{is_admin}', 'true'::jsonb);
    END IF;

    -- Return modified event
    RETURN jsonb_build_object('claims', claims);
END;
$$;

-- Grant execution permission to Supabase Auth
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
```

**2. Enable the hook in Supabase Dashboard:**

- Navigate to Authentication > Hooks (Beta)
- Select "Custom Access Token Hook"
- Choose `public.custom_access_token_hook`
- Save

**3. Use claims in RLS policies:**

```sql
-- Helper function to extract custom claims
CREATE OR REPLACE FUNCTION public.is_admin_from_jwt()
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
        false
    );
END;
$$;

-- Use in RLS policies
CREATE POLICY "Admins can manage all artwork"
    ON artwork FOR ALL
    TO authenticated
    USING ((SELECT is_admin_from_jwt()));
```

**4. Access claims in application code:**

```typescript
// Client-side (JavaScript)
import { jwtDecode } from 'jwt-decode';

const session = await supabase.auth.getSession();
if (session.data.session) {
    const claims = jwtDecode(session.data.session.access_token);
    const isAdmin = claims.is_admin; // true/false
    const userRole = claims.user_role; // 'admin' or 'super_admin'
}
```

**Pros:**

- No database queries needed for permission checks (fastest)
- Works seamlessly with client and server
- Scales to thousands of concurrent users
- JWT contains all permission data
- Industry-standard approach (OAuth2, OIDC)

**Cons:**

- More complex setup (requires auth hooks)
- Claims only update when token is refreshed
- Role changes require user to log out/in or wait for token refresh
- Requires understanding of JWT and auth flows

**Token Refresh Considerations:**

- Claims are baked into JWT at token issuance time
- If admin status changes, user must wait for token refresh (typically 1 hour)
- Can manually trigger refresh: `await supabase.auth.refreshSession()`

**Best For:**

- High-traffic applications
- Applications with frequent permission checks
- Microservices architectures
- Mobile applications
- Real-time applications

---

## Comparison Matrix

| Feature             | Service Role      | SECURITY DEFINER | Custom Claims    |
| ------------------- | ----------------- | ---------------- | ---------------- |
| Setup Complexity    | Low               | Medium           | High             |
| Performance         | Excellent         | Good             | Excellent        |
| Client-side Support | No                | Yes              | Yes              |
| Defense-in-depth    | Minimal           | Strong           | Strong           |
| Real-time Updates   | N/A               | Immediate        | On token refresh |
| Scalability         | Good              | Good             | Excellent        |
| Security Risk       | High (if exposed) | Low              | Low              |

---

## Service Role Key: Critical Security Details

### What is the Service Role Key?

The service role key is a special Supabase API key that **completely bypasses all RLS policies** on all tables. It grants full administrative access to your entire database.

### How Service Role Works with RLS

From official Supabase documentation:

> "If you are getting an RLS error then you have a user session getting into the client or you initialized with the anon key."

The service role key bypasses RLS based on the **Authorization header**, not the apikey parameter. Common issues:

**1. SSR Client Contamination:**

```typescript
// WRONG: SSR client extracts user session from cookies, overriding service role
const supabase = createServerClient(url, SERVICE_ROLE_KEY, { cookies });
await supabase.auth.getUser(); // This sets Authorization header to user token!

// RIGHT: Use dedicated service role client
const adminClient = createServerClient(url, SERVICE_ROLE_KEY, { cookies });
const { data: admin } = await adminClient.from('administrators').select('*'); // Uses service role, bypasses RLS
```

**2. Authorization Header Override:**

```typescript
// WRONG: Manually setting Authorization header
const supabase = createClient(url, SERVICE_ROLE_KEY);
supabase.auth.setSession(userSession); // Overrides service role!

// RIGHT: Keep separate clients for user operations and admin operations
```

**3. Auth Functions Side Effects:**

```typescript
// WRONG: signUp() returns user session, replacing Authorization header
const {
    data: { user },
} = await adminClient.auth.signUp(credentials);
// adminClient is now using user's token, not service role!

// RIGHT: Use admin.createUser() for service role operations
const {
    data: { user },
} = await adminClient.auth.admin.createUser(credentials);
```

### Service Role Best Practices

1. **Never expose to client:** Service role key must ONLY be in server-side code
2. **Environment variables:** Store in `.env.local`, never commit to git
3. **Separate clients:** Keep service role client separate from user-session clients
4. **Minimal use:** Only use when necessary, prefer anon key with RLS when possible
5. **Audit access:** Log all service role operations for security monitoring

---

## Recommendation for This Project

Based on the current architecture (Next.js middleware for admin route protection), I recommend:

### Short-term (Current Implementation): Approach 1 (Service Role)

**Why:**

- Already implemented and working
- Middleware is server-side only (no client exposure risk)
- Simple and maintainable
- Adequate security for current scope

**RLS Configuration:**

```sql
-- Keep RLS enabled for defense-in-depth
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own admin record
CREATE POLICY "Users can read own admin record"
    ON administrators FOR SELECT
    TO authenticated
    USING (auth_id = auth.uid());

-- No modification policies for authenticated role
-- Service role (middleware) handles all admin management
```

### Long-term (If Adding Client-side Admin Features): Approach 2 (SECURITY DEFINER)

**When to upgrade:**

- Adding client-side admin dashboard components
- Implementing real-time admin features
- Adding admin-only client-side queries

**Migration path:**

1. Create `is_admin()` SECURITY DEFINER function
2. Update RLS policies on administrators table to use the function
3. Update RLS policies on other tables (artwork, orders, etc.) to use the function
4. Can keep service role in middleware for performance, but add client-side support

### Future Consideration: Approach 3 (Custom Claims)

**When to consider:**

- Application grows to 1000+ concurrent users
- Need mobile app support
- Implementing complex multi-tenant permissions
- Want to eliminate database queries for auth checks

---

## Code Examples for Implementation

### Example 1: Current Pattern (Service Role in Middleware)

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    // Create service role client
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS
        {
            cookies: {
                /* ... */
            },
        }
    );

    // Check auth
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check admin status - this query bypasses RLS
    const { data: admin } = await supabase
        .from('administrators')
        .select('id, name, role, is_active')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (!admin) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Cache admin session
    // ... rest of middleware
}
```

### Example 2: Upgrading to SECURITY DEFINER Pattern

**Migration SQL:**

```sql
-- Step 1: Create the helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM administrators
        WHERE auth_id = auth.uid()
        AND is_active = true
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Step 2: Update administrators table policies
DROP POLICY IF EXISTS "Users can read own admin record" ON administrators;

CREATE POLICY "Users can read own admin record"
    ON administrators FOR SELECT
    TO authenticated
    USING (auth_id = auth.uid());

CREATE POLICY "Admins can read all administrators"
    ON administrators FOR SELECT
    TO authenticated
    USING ((SELECT is_admin()));

-- Step 3: Add admin policies to other tables
CREATE POLICY "Admins can manage artwork"
    ON artwork FOR ALL
    TO authenticated
    USING ((SELECT is_admin()));

CREATE POLICY "Admins can manage orders"
    ON orders FOR ALL
    TO authenticated
    USING ((SELECT is_admin()));

-- Repeat for other tables...
```

**Client-side usage:**

```typescript
// Client component can now check admin status
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
    const supabase = createClient();  // Uses anon key

    // This works because is_admin() function is available to authenticated users
    const { data: artwork } = await supabase
        .from('artwork')
        .select('*');  // RLS policy will check is_admin() automatically

    return <ArtworkList items={artwork} />;
}
```

### Example 3: Custom Claims Pattern

**SQL setup:**

```sql
-- Create the auth hook
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    claims jsonb;
    admin_record record;
BEGIN
    claims := event->'claims';

    -- Get admin info
    SELECT role, is_active INTO admin_record
    FROM administrators
    WHERE auth_id = (event->>'user_id')::uuid;

    -- Add to JWT if admin
    IF admin_record.is_active THEN
        claims := jsonb_set(claims, '{user_role}', to_jsonb(admin_record.role));
        claims := jsonb_set(claims, '{is_admin}', 'true'::jsonb);
    END IF;

    RETURN jsonb_build_object('claims', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- Helper for RLS policies
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        auth.jwt() -> 'user_metadata' ->> 'user_role',
        'user'
    );
$$;

-- RLS policies using JWT claims
CREATE POLICY "Admins can manage artwork"
    ON artwork FOR ALL
    TO authenticated
    USING (get_user_role() IN ('admin', 'super_admin'));
```

**Application usage:**

```typescript
// Middleware
export async function middleware(request: NextRequest) {
    const supabase = createServerClient(/* ... */);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect('/admin/login');
    }

    // Extract admin status from JWT (no database query needed!)
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const claims = jwtDecode(token);

    if (!claims.is_admin) {
        return NextResponse.redirect('/admin/login');
    }

    // Cache for 15 minutes as before
    // ...
}

// Client component
import { useAuth } from '@/hooks/useAuth';

export default function AdminHeader() {
    const { session } = useAuth();
    const claims = session ? jwtDecode(session.access_token) : null;

    return (
        <header>
            <span>Role: {claims?.user_role}</span>
        </header>
    );
}
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Circular Dependencies in RLS

**Problem:**

```sql
-- This causes infinite recursion!
CREATE POLICY "Admin access" ON administrators
USING (
    auth.uid() IN (SELECT auth_id FROM administrators WHERE is_active = true)
);
```

**Solution:** Use SECURITY DEFINER function or service role client.

### Pitfall 2: Service Role Key Exposure

**Problem:**

```typescript
// NEVER do this!
const supabase = createBrowserClient(url, SERVICE_ROLE_KEY);
```

**Solution:** Only use service role in server-side code, never in client bundles.

### Pitfall 3: Session Contamination

**Problem:**

```typescript
const supabase = createServerClient(url, SERVICE_ROLE_KEY, { cookies });
await supabase.auth.getUser(); // Overwrites Authorization header!
const { data } = await supabase.from('table').select(); // Now uses user session, not service role!
```

**Solution:** Keep separate clients or avoid mixing auth operations with data operations.

### Pitfall 4: Stale JWT Claims

**Problem:**

```typescript
// User is promoted to admin in database
await supabase.from('administrators').insert({ auth_id: user.id });

// But JWT still shows is_admin: false for up to 1 hour!
const claims = jwtDecode(session.access_token);
console.log(claims.is_admin); // false
```

**Solution:**

```typescript
// Force token refresh after permission changes
await supabase.auth.refreshSession();
const newSession = await supabase.auth.getSession();
const newClaims = jwtDecode(newSession.data.session.access_token);
console.log(newClaims.is_admin); // true
```

---

## Testing Considerations

### Testing Service Role Patterns

```typescript
// Test file
import { createServiceRoleClient } from '@/lib/supabase/server';

describe('Admin authentication', () => {
    it('should allow service role to bypass RLS', async () => {
        const supabase = await createServiceRoleClient();

        // Should return all administrators, regardless of RLS
        const { data, error } = await supabase
            .from('administrators')
            .select('*');

        expect(error).toBeNull();
        expect(data).toHaveLength(2); // All admins, not filtered by RLS
    });
});
```

### Testing SECURITY DEFINER Functions

```sql
-- Test the function directly
SELECT is_admin();  -- Should return true if current user is admin

-- Test with different users
SET ROLE authenticated;
SET "request.jwt.claims" = '{"sub": "user-id-here"}';
SELECT is_admin();  -- Should return appropriate value
```

### Testing Custom Claims

```typescript
describe('Custom claims', () => {
    it('should include admin role in JWT', async () => {
        const {
            data: { session },
        } = await supabase.auth.signInWithPassword({
            email: 'admin@example.com',
            password: 'password',
        });

        const claims = jwtDecode(session.access_token);
        expect(claims.is_admin).toBe(true);
        expect(claims.user_role).toBe('admin');
    });
});
```

---

## References

### Official Supabase Documentation

- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [Service Role Key Issues](https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z)

### Community Resources

- [Admin User Permissions with RLS](https://akoskm.com/admin-user-permissions-in-supabase-with-rls/) - Akos Komuves
- [SECURITY DEFINER Functions in Supabase](https://blog.entrostat.com/supabase-rls-functions/)
- [Easy RLS Policies in Supabase](https://maxlynch.com/2023/11/04/tips-for-row-level-security-rls-in-postgres-and-supabase/)
- [Setting Up User and Admin Roles](https://dev.to/shahidkhans/setting-up-row-level-security-in-supabase-user-and-admin-2ac1)

### PostgreSQL Documentation

- [CREATE FUNCTION - SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## Appendix: Migration Checklist

If upgrading from Approach 1 (Service Role) to Approach 2 (SECURITY DEFINER):

- [ ] Create `is_admin()` SECURITY DEFINER function
- [ ] Grant EXECUTE permission to authenticated role
- [ ] Test function with different users
- [ ] Update RLS policies on administrators table
- [ ] Update RLS policies on other tables (artwork, orders, etc.)
- [ ] Update client-side code to use anon key for admin queries
- [ ] Test client-side admin features
- [ ] Update tests
- [ ] Run `npm run build:full` to verify no errors
- [ ] Deploy and monitor for RLS errors

If upgrading to Approach 3 (Custom Claims):

- [ ] Create `custom_access_token_hook` function
- [ ] Grant permission to supabase_auth_admin
- [ ] Enable hook in Supabase Dashboard
- [ ] Create helper functions for RLS (e.g., `get_user_role()`)
- [ ] Update all RLS policies to use JWT claims
- [ ] Update middleware to read from JWT
- [ ] Update client code to read from JWT
- [ ] Implement token refresh logic for permission changes
- [ ] Test with multiple users
- [ ] Update tests
- [ ] Deploy and monitor

---

**Last Updated:** 2025-11-13
**Next Review:** When implementing client-side admin features

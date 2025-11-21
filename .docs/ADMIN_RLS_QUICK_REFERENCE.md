# Admin RLS Quick Reference

**For full details, see:** [ADMIN_RLS_PATTERNS.md](./ADMIN_RLS_PATTERNS.md)

---

## The Problem

Checking if a user is admin by querying the `administrators` table inside an RLS policy on the `administrators` table creates infinite recursion:

```sql
-- DON'T DO THIS - causes infinite recursion!
CREATE POLICY "Admin access" ON administrators
USING (
    auth.uid() IN (SELECT auth_id FROM administrators WHERE is_active = true)
    -- This SELECT triggers the policy we're defining, causing recursion
);
```

---

## Three Solutions

### 1. Service Role (Current Implementation) ✓

**Use in:** Server-side only (middleware, API routes)

**Setup:**

```sql
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own admin record"
    ON administrators FOR SELECT
    TO authenticated
    USING (auth_id = auth.uid());
```

**Server code:**

```typescript
// Uses service role key - bypasses ALL RLS
const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Bypasses RLS
    { cookies }
);

const { data: admin } = await supabase
    .from('administrators')
    .select('*') // No RLS applied
    .eq('auth_id', user.id);
```

**Pros:** Simple, already working
**Cons:** No client-side support, service role must stay secret
**Best for:** Current middleware pattern

---

### 2. SECURITY DEFINER Function (Recommended for Client-side)

**Use in:** Both client and server

**Setup:**

```sql
-- Create function that bypasses RLS internally
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM administrators
        WHERE auth_id = auth.uid()
        AND is_active = true
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Use function in RLS policies
CREATE POLICY "Admins can manage artwork"
    ON artwork FOR ALL
    TO authenticated
    USING ((SELECT is_admin()));  -- Wrap in SELECT for caching
```

**Client code:**

```typescript
// Uses anon key - RLS automatically checks is_admin()
const supabase = createClient(); // Anon key

const { data } = await supabase.from('artwork').select('*'); // RLS policy calls is_admin() function
```

**Pros:** Works client-side, proper RLS, no circular dependency
**Cons:** Slightly more complex
**Best for:** Adding client-side admin features

---

### 3. Custom Claims (Best for Scale)

**Use in:** Both client and server, high-traffic apps

**Setup:**

```sql
-- Auth hook adds admin role to JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    claims jsonb;
    user_role text;
BEGIN
    claims := event->'claims';

    SELECT role INTO user_role
    FROM administrators
    WHERE auth_id = (event->>'user_id')::uuid
    AND is_active = true;

    IF user_role IS NOT NULL THEN
        claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
        claims := jsonb_set(claims, '{is_admin}', 'true'::jsonb);
    END IF;

    RETURN jsonb_build_object('claims', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Enable in Supabase Dashboard: Auth > Hooks > Custom Access Token

-- RLS policies read from JWT
CREATE POLICY "Admins can manage artwork"
    ON artwork FOR ALL
    TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );
```

**Client code:**

```typescript
import { jwtDecode } from 'jwt-decode';

const session = await supabase.auth.getSession();
const claims = jwtDecode(session.data.session.access_token);

if (claims.is_admin) {
    // Show admin UI
}
```

**Pros:** No database queries, scales infinitely, works everywhere
**Cons:** Complex setup, claims update on token refresh only
**Best for:** Large apps, mobile apps, real-time features

---

## Comparison

| Approach         | Setup  | Client Support | Performance | Current Status   |
| ---------------- | ------ | -------------- | ----------- | ---------------- |
| Service Role     | Easy   | No             | Excellent   | ✓ Implemented    |
| SECURITY DEFINER | Medium | Yes            | Good        | Recommended next |
| Custom Claims    | Hard   | Yes            | Excellent   | Future upgrade   |

---

## Recommendation

**Now:** Keep Service Role approach (already working)

**Next:** Upgrade to SECURITY DEFINER when adding client-side admin features

**Future:** Consider Custom Claims if scaling to 1000+ users

---

## Key Security Rules

1. **NEVER** expose service role key to client
2. **ALWAYS** use service role only in server-side code
3. **WRAP** SECURITY DEFINER functions in SELECT for performance
4. **SET** `search_path = public` in SECURITY DEFINER functions
5. **GRANT** explicit EXECUTE permissions on functions

---

## Common Error: "Database error querying schema"

**Cause:** Trying to use `auth.users` metadata in RLS policy

**Wrong:**

```sql
-- This breaks authentication flow!
CREATE POLICY "Check metadata"
USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);
```

**Right:** Use one of the three approaches above instead

---

**See full documentation:** [ADMIN_RLS_PATTERNS.md](./ADMIN_RLS_PATTERNS.md)

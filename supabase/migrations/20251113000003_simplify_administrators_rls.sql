-- Simplify administrators RLS approach
-- The administrators table is ONLY accessed via service role (middleware/API routes)
-- Service role bypasses RLS, so we only need basic policies for defense-in-depth
-- These policies won't affect normal operation but protect against misconfiguration

-- Drop the complex function-based policies that were causing auth issues
DROP POLICY IF EXISTS "Admins can view all administrators" ON administrators;
DROP POLICY IF EXISTS "Admins can manage administrators" ON administrators;
DROP POLICY IF EXISTS "Service role has full access" ON administrators;
DROP FUNCTION IF EXISTS public.is_authenticated_admin();

-- Keep RLS enabled for defense-in-depth
-- (Service role bypasses these policies automatically)
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- Minimal policy: If someone somehow gets authenticated access with anon key,
-- they can only read their own admin record (not modify)
CREATE POLICY "Users can read own admin record"
    ON administrators FOR SELECT
    TO authenticated
    USING (auth_id = auth.uid());

-- No INSERT, UPDATE, DELETE policies for authenticated role
-- Only service role (used by middleware/API) can modify administrators
-- This is secure because:
-- 1. Service role key is never exposed to client
-- 2. Service role bypasses RLS anyway
-- 3. All admin operations go through middleware which uses service role

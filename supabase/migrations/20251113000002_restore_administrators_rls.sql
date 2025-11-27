-- Restore RLS on administrators table with proper policies that avoid infinite recursion
-- Solution: Store admin role claim in auth.users metadata, check that instead of administrators table
-- This breaks the circular dependency that caused infinite recursion

-- First, create a function to check if current user has admin claim in JWT
-- This checks auth metadata, not the administrators table, breaking the recursion
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_auth_id uuid;
    is_admin boolean;
BEGIN
    -- Get the current authenticated user's ID
    user_auth_id := auth.uid();

    -- Return false if no authenticated user
    IF user_auth_id IS NULL THEN
        RETURN false;
    END IF;

    -- Check auth.users metadata for admin claim
    -- This uses auth schema, not administrators table, avoiding recursion
    SELECT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_auth_id
        AND raw_user_meta_data->>'is_admin' = 'true'
    ) INTO is_admin;

    RETURN COALESCE(is_admin, false);
END;
$$;

-- Re-enable RLS on administrators table
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (bypasses RLS anyway, but explicit is good)
-- Service role is used by middleware for authentication checks
CREATE POLICY "Service role has full access"
    ON administrators FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated admins can read all administrator records
-- Uses the helper function which checks auth.users, not administrators table
CREATE POLICY "Admins can view all administrators"
    ON administrators FOR SELECT
    TO authenticated
    USING (is_authenticated_admin());

-- Policy: Authenticated admins can manage all administrators
-- Uses the helper function which checks auth.users, not administrators table
CREATE POLICY "Admins can manage administrators"
    ON administrators FOR ALL
    TO authenticated
    USING (is_authenticated_admin())
    WITH CHECK (is_authenticated_admin());

-- Note: The middleware uses service role key which bypasses RLS
-- These policies provide defense-in-depth for direct database access
-- The is_admin flag in auth.users metadata must be set when creating admins

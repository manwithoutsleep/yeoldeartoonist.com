-- Fix infinite recursion in administrators RLS policies
-- The problem: RLS policies on administrators table query the administrators table itself
-- Solution: Drop the circular policies and rely on service role key in middleware

-- Drop the problematic RLS policies
DROP POLICY IF EXISTS "Admins can view all administrators" ON administrators;
DROP POLICY IF EXISTS "Only super_admin can manage administrators" ON administrators;

-- The administrators table should only be accessible via service role key (middleware/API routes)
-- No RLS policies needed since admins are managed server-side only

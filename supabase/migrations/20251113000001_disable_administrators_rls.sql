-- Disable RLS on administrators table
-- The administrators table should only be accessed via service role key (middleware/API routes)
-- No RLS needed since access is controlled at the application level

ALTER TABLE administrators DISABLE ROW LEVEL SECURITY;

-- Note: The service role key will now have full access to this table
-- This is intentional and secure since:
-- 1. Service role key is only used server-side (middleware, API routes)
-- 2. Service role key is never exposed to the client
-- 3. Admin operations are protected by middleware authentication checks

-- Proper script to create an admin user
-- This uses Supabase's built-in user creation which handles all required columns
-- Run this in Supabase Studio SQL Editor

-- IMPORTANT: Change these values before running!
DO $$
DECLARE
    admin_email TEXT := 'admin@example.com';  -- Change this!
    admin_name TEXT := 'Admin User';  -- Change this!

    -- The user should be created via Supabase Studio UI or Admin API
    -- This script just links an existing auth user to the administrators table
    --
    -- Step 1: Create the auth user in Supabase Studio:
    --   1. Go to Authentication > Users
    --   2. Click "Add user" > "Create new user"
    --   3. Enter email and password
    --   4. Make sure "Auto Confirm User" is checked
    --   5. Click "Create user"
    --   6. Copy the user's ID (UUID)
    --
    -- Step 2: Run this script with the UUID from step 1

    user_id UUID := '00000000-0000-0000-0000-000000000000';  -- PASTE THE UUID HERE!
BEGIN
    -- Verify the user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
        RAISE EXCEPTION 'User with ID % does not exist. Please create the user in Supabase Studio first.', user_id;
    END IF;

    -- Check if admin record already exists
    IF EXISTS (SELECT 1 FROM administrators WHERE auth_id = user_id) THEN
        RAISE NOTICE 'Administrator record already exists for user %', user_id;
        RETURN;
    END IF;

    -- Create administrator record
    INSERT INTO administrators (auth_id, email, name, role, is_active)
    VALUES (user_id, admin_email, admin_name, 'super_admin', true);

    RAISE NOTICE 'Successfully created administrator record for: %', admin_email;
    RAISE NOTICE 'User ID: %', user_id;
END $$;

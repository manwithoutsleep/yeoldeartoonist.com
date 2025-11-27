-- Simple script to create an admin user
-- Run this in Supabase Studio SQL Editor
-- IMPORTANT: Update the email, password, and name below before running!

-- Configuration - CHANGE THESE VALUES
DO $$
DECLARE
    admin_email TEXT := 'admin@example.com';  -- Change this to your admin email
    admin_password TEXT := 'your-secure-password';  -- Change this to your admin password
    admin_name TEXT := 'Admin User';  -- Change this to your admin name
    new_user_id UUID;
BEGIN
    -- Step 1: Create auth user (no special metadata needed)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        ''
    ) RETURNING id INTO new_user_id;

    RAISE NOTICE 'Created auth user with ID: %', new_user_id;

    -- Step 2: Create corresponding administrator record
    INSERT INTO administrators (auth_id, email, name, role, is_active)
    VALUES (
        new_user_id,
        admin_email,
        admin_name,
        'super_admin',
        true
    );

    RAISE NOTICE 'Created administrator record for: %', admin_email;
    RAISE NOTICE 'You can now log in with email: % and the password you set', admin_email;
END $$;

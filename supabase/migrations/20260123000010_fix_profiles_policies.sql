-- Fix profiles table: Add INSERT policy and create missing profiles

-- Add INSERT policy so users can create their own profile
-- (for cases where the trigger didn't run)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create profiles for any existing auth users who don't have one
INSERT INTO profiles (id, email, full_name, avatar_url, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
  CASE
    WHEN LOWER(u.email) = 'anthonychege599@gmail.com' THEN 'admin'::user_role
    WHEN u.raw_user_meta_data->>'country' IS NOT NULL THEN 'owner'::user_role
    ELSE 'visitor'::user_role
  END
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
);

-- Update existing admin user to have admin role (in case profile exists but wrong role)
UPDATE profiles
SET role = 'admin'::user_role
WHERE email ILIKE 'anthonychege599@gmail.com';

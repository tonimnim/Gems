-- Create a secure function for admins to delete gems
-- SECURITY DEFINER allows bypassing RLS for admin operations

CREATE OR REPLACE FUNCTION admin_delete_gem(gem_id UUID, user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is admin
  SELECT role INTO user_role FROM profiles WHERE id = user_id;

  IF user_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can delete gems');
  END IF;

  -- Delete related data first (cascade might handle this, but being explicit)
  DELETE FROM gem_media WHERE gem_media.gem_id = admin_delete_gem.gem_id;
  DELETE FROM ratings WHERE ratings.gem_id = admin_delete_gem.gem_id;
  DELETE FROM favorites WHERE favorites.gem_id = admin_delete_gem.gem_id;

  -- Delete the gem
  DELETE FROM gems WHERE id = admin_delete_gem.gem_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_delete_gem(UUID, UUID) TO authenticated;

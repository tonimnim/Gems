-- Create a secure function to increment view count
-- SECURITY DEFINER means it runs with the privileges of the function owner (postgres)
-- This bypasses RLS safely for this specific operation only

CREATE OR REPLACE FUNCTION increment_gem_views(gem_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE gems
  SET views_count = views_count + 1
  WHERE id = gem_id;
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION increment_gem_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_gem_views(UUID) TO authenticated;

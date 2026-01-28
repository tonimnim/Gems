-- Update gem visibility: public only sees approved gems with valid payment term
-- Owners can always see their own gems, admins can see all

-- Drop existing select policy
DROP POLICY IF EXISTS "Approved gems viewable by everyone" ON gems;

-- Public can view approved gems with active subscription
CREATE POLICY "Public can view active gems"
  ON gems FOR SELECT
  TO anon, authenticated
  USING (
    -- Gem must be approved AND have valid term
    (status = 'approved' AND current_term_end > NOW())
    -- OR user is the owner (can see their own gems regardless)
    OR owner_id = auth.uid()
  );

-- Note: Admin policy already exists from previous migration (20260128000005)

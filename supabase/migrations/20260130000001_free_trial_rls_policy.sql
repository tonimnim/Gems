-- During free trial, allow viewing all approved gems regardless of current_term_end
-- The subscription check will be handled at the application level when free trial ends

-- Drop existing visibility policy
DROP POLICY IF EXISTS "Public can view active gems" ON gems;

-- New policy: approved gems are visible to everyone
-- Subscription logic is handled at the application level
CREATE POLICY "Public can view approved gems"
  ON gems FOR SELECT
  TO anon, authenticated
  USING (
    -- Gem must be approved
    status = 'approved'
    -- OR user is the owner (can see their own gems regardless of status)
    OR owner_id = auth.uid()
  );

-- Note: When free trial ends and you want to enforce subscriptions at DB level,
-- you can update this policy to include: AND current_term_end > NOW()

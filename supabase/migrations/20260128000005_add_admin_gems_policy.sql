-- Allow admins to view all gems (including pending ones for verification)
CREATE POLICY "Admins can view all gems"
  ON gems FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update any gem (for approval/rejection)
CREATE POLICY "Admins can update all gems"
  ON gems FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

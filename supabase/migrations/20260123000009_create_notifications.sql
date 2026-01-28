-- Notifications table for real-time notifications

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'new_review',
  'gem_approved',
  'gem_rejected',
  'payment_success',
  'payment_failed',
  'listing_expiring',
  'gem_saved',
  'saved_gem_updated',
  'new_gem_pending',
  'new_payment'
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- TRIGGER FUNCTIONS FOR AUTO-NOTIFICATIONS
-- ============================================

-- Get admin user IDs (for admin notifications)
CREATE OR REPLACE FUNCTION get_admin_user_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY SELECT id FROM profiles WHERE role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Notify owner when someone reviews their gem
CREATE OR REPLACE FUNCTION notify_on_new_review()
RETURNS TRIGGER AS $$
DECLARE
  gem_record RECORD;
  reviewer_name TEXT;
BEGIN
  -- Get gem details
  SELECT g.id, g.name, g.owner_id INTO gem_record
  FROM gems g WHERE g.id = NEW.gem_id;

  -- Get reviewer name
  SELECT COALESCE(full_name, 'Someone') INTO reviewer_name
  FROM profiles WHERE id = NEW.user_id;

  -- Don't notify if owner reviews their own gem
  IF gem_record.owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Create notification for gem owner
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    gem_record.owner_id,
    'new_review',
    'New Review',
    reviewer_name || ' left a ' || NEW.score || '-star review on ' || gem_record.name,
    jsonb_build_object(
      'gem_id', gem_record.id,
      'gem_name', gem_record.name,
      'review_id', NEW.id,
      'rating', NEW.score
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_new_review_trigger
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_review();

-- 2. Notify owner when gem status changes (approved/rejected)
CREATE OR REPLACE FUNCTION notify_on_gem_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Gem approved
  IF NEW.status = 'approved' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.owner_id,
      'gem_approved',
      'Gem Approved!',
      'Your gem "' || NEW.name || '" has been approved and is now live.',
      jsonb_build_object('gem_id', NEW.id, 'gem_name', NEW.name)
    );
  END IF;

  -- Gem rejected
  IF NEW.status = 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.owner_id,
      'gem_rejected',
      'Gem Not Approved',
      'Your gem "' || NEW.name || '" was not approved. ' || COALESCE(NEW.rejection_reason, 'Please review and resubmit.'),
      jsonb_build_object('gem_id', NEW.id, 'gem_name', NEW.name)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_gem_status_change_trigger
  AFTER UPDATE ON gems
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_gem_status_change();

-- 3. Notify admin when new gem is submitted for verification
CREATE OR REPLACE FUNCTION notify_admin_on_new_gem()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Only for new pending gems
  IF NEW.status = 'pending' THEN
    FOR admin_id IN SELECT * FROM get_admin_user_ids()
    LOOP
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        admin_id,
        'new_gem_pending',
        'New Gem Pending',
        'A new gem "' || NEW.name || '" is waiting for verification.',
        jsonb_build_object('gem_id', NEW.id, 'gem_name', NEW.name)
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_admin_new_gem_trigger
  AFTER INSERT ON gems
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_new_gem();

-- 4. Notify on payment status change
CREATE OR REPLACE FUNCTION notify_on_payment_status_change()
RETURNS TRIGGER AS $$
DECLARE
  gem_record RECORD;
  admin_id UUID;
BEGIN
  -- Get gem details
  SELECT id, name INTO gem_record FROM gems WHERE id = NEW.gem_id;

  -- Payment completed - notify owner
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'payment_success',
      'Payment Successful',
      'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' for "' || gem_record.name || '" was successful.',
      jsonb_build_object('gem_id', gem_record.id, 'gem_name', gem_record.name, 'payment_id', NEW.id)
    );

    -- Also notify admins
    FOR admin_id IN SELECT * FROM get_admin_user_ids()
    LOOP
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        admin_id,
        'new_payment',
        'New Payment Received',
        'Payment of ' || NEW.amount || ' ' || NEW.currency || ' received for "' || gem_record.name || '".',
        jsonb_build_object('gem_id', gem_record.id, 'gem_name', gem_record.name, 'payment_id', NEW.id)
      );
    END LOOP;
  END IF;

  -- Payment failed - notify owner
  IF NEW.status = 'failed' AND (OLD.status IS NULL OR OLD.status != 'failed') THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'payment_failed',
      'Payment Failed',
      'Your payment for "' || gem_record.name || '" failed. Please try again.',
      jsonb_build_object('gem_id', gem_record.id, 'gem_name', gem_record.name, 'payment_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_payment_status_trigger
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_payment_status_change();

-- 5. Notify owner when someone saves their gem
CREATE OR REPLACE FUNCTION notify_on_gem_saved()
RETURNS TRIGGER AS $$
DECLARE
  gem_record RECORD;
  saver_name TEXT;
BEGIN
  -- Get gem details
  SELECT g.id, g.name, g.owner_id INTO gem_record
  FROM gems g WHERE g.id = NEW.gem_id;

  -- Don't notify if owner saves their own gem
  IF gem_record.owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get saver name
  SELECT COALESCE(full_name, 'Someone') INTO saver_name
  FROM profiles WHERE id = NEW.user_id;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    gem_record.owner_id,
    'gem_saved',
    'Gem Saved',
    saver_name || ' saved your gem "' || gem_record.name || '".',
    jsonb_build_object('gem_id', gem_record.id, 'gem_name', gem_record.name)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_gem_saved_trigger
  AFTER INSERT ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_gem_saved();

-- 6. Notify users when a gem they saved is updated
CREATE OR REPLACE FUNCTION notify_on_saved_gem_updated()
RETURNS TRIGGER AS $$
DECLARE
  fav_record RECORD;
BEGIN
  -- Only notify on significant updates (name, description, status becoming approved)
  IF OLD.name = NEW.name AND OLD.description = NEW.description AND OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Don't notify for non-approved gems
  IF NEW.status != 'approved' THEN
    RETURN NEW;
  END IF;

  -- Notify all users who saved this gem (except the owner)
  FOR fav_record IN
    SELECT f.user_id FROM favorites f WHERE f.gem_id = NEW.id AND f.user_id != NEW.owner_id
  LOOP
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      fav_record.user_id,
      'saved_gem_updated',
      'Saved Gem Updated',
      '"' || NEW.name || '" has been updated.',
      jsonb_build_object('gem_id', NEW.id, 'gem_name', NEW.name)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_saved_gem_updated_trigger
  AFTER UPDATE ON gems
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_saved_gem_updated();

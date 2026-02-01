-- Fix ratings trigger and recalculate all gem ratings

-- Recreate the trigger function
CREATE OR REPLACE FUNCTION update_gem_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_gem_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_gem_id := OLD.gem_id;
  ELSE
    target_gem_id := NEW.gem_id;
  END IF;

  UPDATE gems SET
    average_rating = COALESCE((SELECT ROUND(AVG(score)::numeric, 1) FROM ratings WHERE gem_id = target_gem_id), 0),
    ratings_count = (SELECT COUNT(*) FROM ratings WHERE gem_id = target_gem_id),
    updated_at = NOW()
  WHERE id = target_gem_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_gem_rating_trigger ON ratings;
CREATE TRIGGER update_gem_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_gem_rating();

-- Recalculate all gem ratings from existing ratings
UPDATE gems g SET
  average_rating = COALESCE((SELECT ROUND(AVG(score)::numeric, 1) FROM ratings r WHERE r.gem_id = g.id), 0),
  ratings_count = (SELECT COUNT(*) FROM ratings r WHERE r.gem_id = g.id);

-- Ratings table (user reviews)

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gem_id UUID NOT NULL REFERENCES gems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gem_id, user_id) -- One rating per user per gem
);

CREATE INDEX idx_ratings_gem_id ON ratings(gem_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Auto-update gem's average rating
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

CREATE TRIGGER update_gem_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_gem_rating();

-- RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings viewable by everyone"
  ON ratings FOR SELECT USING (true);

CREATE POLICY "Auth users can insert ratings"
  ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON ratings FOR DELETE USING (auth.uid() = user_id);

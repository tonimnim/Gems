-- Gem media table (images/videos for gems)

CREATE TABLE gem_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gem_id UUID NOT NULL REFERENCES gems(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type media_type DEFAULT 'image',
  is_cover BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gem_media_gem_id ON gem_media(gem_id);

-- Ensure only one cover image per gem
CREATE OR REPLACE FUNCTION ensure_single_cover()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_cover = TRUE THEN
    UPDATE gem_media SET is_cover = FALSE
    WHERE gem_id = NEW.gem_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER single_cover_image
  AFTER INSERT OR UPDATE OF is_cover ON gem_media
  FOR EACH ROW
  WHEN (NEW.is_cover = TRUE)
  EXECUTE FUNCTION ensure_single_cover();

-- RLS
ALTER TABLE gem_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media viewable if gem viewable"
  ON gem_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM gems
    WHERE gems.id = gem_media.gem_id
    AND (gems.status = 'approved' OR gems.owner_id = auth.uid())
  ));

CREATE POLICY "Owners can manage gem media"
  ON gem_media FOR ALL
  USING (EXISTS (
    SELECT 1 FROM gems
    WHERE gems.id = gem_media.gem_id
    AND gems.owner_id = auth.uid()
  ));

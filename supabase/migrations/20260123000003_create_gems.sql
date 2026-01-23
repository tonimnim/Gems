-- Gems table (main listings)

CREATE TABLE gems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category gem_category NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  opening_hours TEXT,
  price_range TEXT,
  status gem_status DEFAULT 'pending',
  tier gem_tier DEFAULT 'standard',
  rejection_reason TEXT,
  views_count INTEGER DEFAULT 0,
  average_rating DECIMAL(2, 1) DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  current_term_start TIMESTAMPTZ,
  current_term_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gems_owner_id ON gems(owner_id);
CREATE INDEX idx_gems_status ON gems(status);
CREATE INDEX idx_gems_category ON gems(category);
CREATE INDEX idx_gems_country ON gems(country);
CREATE INDEX idx_gems_city ON gems(city);
CREATE INDEX idx_gems_tier ON gems(tier);

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_gem_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  new_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM gems WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_gem_slug
  BEFORE INSERT OR UPDATE OF name ON gems
  FOR EACH ROW
  EXECUTE FUNCTION generate_gem_slug();

-- RLS
ALTER TABLE gems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved gems viewable by everyone"
  ON gems FOR SELECT
  USING (status = 'approved' OR owner_id = auth.uid());

CREATE POLICY "Owners can insert gems"
  ON gems FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own gems"
  ON gems FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own gems"
  ON gems FOR DELETE USING (auth.uid() = owner_id);

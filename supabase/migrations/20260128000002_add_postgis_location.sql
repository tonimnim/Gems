-- Enable PostGIS extension (free in Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add a geography column to gems for spatial queries
ALTER TABLE gems ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);

-- Create index for fast spatial queries
CREATE INDEX IF NOT EXISTS gems_location_idx ON gems USING GIST (location);

-- Function to automatically update location from lat/lng
CREATE OR REPLACE FUNCTION update_gem_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update location on insert/update
DROP TRIGGER IF EXISTS gem_location_trigger ON gems;
CREATE TRIGGER gem_location_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude ON gems
  FOR EACH ROW
  EXECUTE FUNCTION update_gem_location();

-- Update existing gems that have coordinates
UPDATE gems
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Function to find gems within a radius (in meters)
CREATE OR REPLACE FUNCTION nearby_gems(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 50000 -- 50km default
)
RETURNS TABLE (
  id UUID,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    ST_Distance(
      g.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  FROM gems g
  WHERE g.status = 'approved'
    AND g.location IS NOT NULL
    AND ST_DWithin(
      g.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

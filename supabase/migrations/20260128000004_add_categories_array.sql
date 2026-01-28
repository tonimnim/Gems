-- Add categories array column to gems table
ALTER TABLE gems ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing category data to categories array
UPDATE gems
SET categories = ARRAY[category]
WHERE category IS NOT NULL AND (categories IS NULL OR array_length(categories, 1) IS NULL);

-- Create index for category array searches
CREATE INDEX IF NOT EXISTS gems_categories_idx ON gems USING GIN (categories);

-- Add check constraint to limit to max 3 categories
ALTER TABLE gems ADD CONSTRAINT max_three_categories
CHECK (array_length(categories, 1) IS NULL OR array_length(categories, 1) <= 3);

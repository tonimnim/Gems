-- Add social media columns to gems table
ALTER TABLE gems ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE gems ADD COLUMN IF NOT EXISTS tiktok TEXT;

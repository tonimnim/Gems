-- Page views table for tracking traffic
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(255) NOT NULL,
  path VARCHAR(500),
  referrer VARCHAR(500),
  user_agent TEXT,
  country VARCHAR(2),
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries by time
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_page_idx ON page_views (page);

-- Function to get hourly traffic for the last 24 hours
CREATE OR REPLACE FUNCTION get_hourly_traffic(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
  hour TIMESTAMP WITH TIME ZONE,
  views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('hour', pv.created_at) as hour,
    COUNT(*) as views
  FROM page_views pv
  WHERE pv.created_at >= NOW() - (hours_back || ' hours')::INTERVAL
  GROUP BY date_trunc('hour', pv.created_at)
  ORDER BY hour ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily traffic for the last N days
CREATE OR REPLACE FUNCTION get_daily_traffic(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  day DATE,
  views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(pv.created_at) as day,
    COUNT(*) as views
  FROM page_views pv
  WHERE pv.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(pv.created_at)
  ORDER BY day ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get traffic stats
CREATE OR REPLACE FUNCTION get_traffic_stats()
RETURNS TABLE (
  total_today BIGINT,
  total_week BIGINT,
  total_month BIGINT,
  unique_pages_today BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as total_today,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as total_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as total_month,
    COUNT(DISTINCT page) FILTER (WHERE created_at >= CURRENT_DATE) as unique_pages_today
  FROM page_views;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for tracking)
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read (public stats)
CREATE POLICY "Anyone can read page views"
  ON page_views FOR SELECT
  USING (true);

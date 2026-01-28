import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Simple in-memory cache
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

// GET - Fetch traffic stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hourly';
    const range = parseInt(searchParams.get('range') || '24');

    const cacheKey = `traffic:${type}:${range}`;

    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    const supabase = await createClient();

    // Combined query for both hourly and daily
    if (type === 'all') {
      const [hourlyRes, dailyRes] = await Promise.all([
        supabase.rpc('get_hourly_traffic', { hours_back: 24 }),
        supabase.rpc('get_daily_traffic', { days_back: 7 }),
      ]);

      const result = {
        hourly: hourlyRes.data || [],
        daily: dailyRes.data || [],
      };

      setCache(cacheKey, result);
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    if (type === 'stats') {
      const { data, error } = await supabase.rpc('get_traffic_stats');

      if (error) {
        console.error('Error fetching traffic stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
      }

      const result = { data: data?.[0] || {} };
      setCache(cacheKey, result);
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    if (type === 'hourly') {
      const { data, error } = await supabase.rpc('get_hourly_traffic', {
        hours_back: range,
      });

      if (error) {
        console.error('Error fetching hourly traffic:', error);
        return NextResponse.json({ error: 'Failed to fetch traffic' }, { status: 500 });
      }

      const result = { data: data || [] };
      setCache(cacheKey, result);
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    if (type === 'daily') {
      const { data, error } = await supabase.rpc('get_daily_traffic', {
        days_back: range,
      });

      if (error) {
        console.error('Error fetching daily traffic:', error);
        return NextResponse.json({ error: 'Failed to fetch traffic' }, { status: 500 });
      }

      const result = { data: data || [] };
      setCache(cacheKey, result);
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    // Get recent page views
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching page views:', error);
      return NextResponse.json({ error: 'Failed to fetch page views' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST - Track a page view (no caching needed)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { page, path, referrer } = body;

    if (!page) {
      return NextResponse.json({ error: 'Page is required' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const country = request.headers.get('cf-ipcountry') ||
                   request.headers.get('x-vercel-ip-country') ||
                   undefined;
    const city = request.headers.get('cf-ipcity') ||
                request.headers.get('x-vercel-ip-city') ||
                undefined;

    const { error } = await supabase.from('page_views').insert({
      page,
      path,
      referrer,
      user_agent: userAgent,
      country,
      city,
    });

    if (error) {
      console.error('Error tracking page view:', error);
      return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

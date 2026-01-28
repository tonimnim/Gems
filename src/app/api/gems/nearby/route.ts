import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '50000'; // Default 50km
    const limit = searchParams.get('limit') || '10';

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseInt(radius);
    const limitNum = parseInt(limit);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Call the PostGIS function to get nearby gem IDs with distances
    const { data: nearbyData, error: nearbyError } = await supabase
      .rpc('nearby_gems', {
        user_lat: latitude,
        user_lng: longitude,
        radius_meters: radiusMeters,
      });

    if (nearbyError) {
      console.error('Error fetching nearby gems:', nearbyError);
      // Fall back to country-based filtering if PostGIS not available
      return fallbackToCountryFilter(supabase, searchParams);
    }

    if (!nearbyData || nearbyData.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        message: 'No gems found nearby',
      });
    }

    // Get the gem IDs in order
    const gemIds = nearbyData.slice(0, limitNum).map((g: { id: string }) => g.id);
    const distanceMap = new Map<string, number>(
      nearbyData.map((g: { id: string; distance_meters: number }) => [g.id, g.distance_meters])
    );

    // Fetch full gem details
    const { data: gems, error: gemsError } = await supabase
      .from('gems')
      .select(`
        *,
        media:gem_media(*)
      `)
      .in('id', gemIds);

    if (gemsError) {
      console.error('Error fetching gem details:', gemsError);
      return NextResponse.json(
        { error: 'Failed to fetch gems' },
        { status: 500 }
      );
    }

    // Add distance to each gem and sort by distance
    const gemsWithDistance = gems
      ?.map((gem) => ({
        ...gem,
        distance_meters: distanceMap.get(gem.id) || 0,
        distance_km: ((distanceMap.get(gem.id) || 0) / 1000).toFixed(1),
      }))
      .sort((a, b) => a.distance_meters - b.distance_meters);

    return NextResponse.json({
      data: gemsWithDistance,
      total: nearbyData.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Fallback function if PostGIS is not available
async function fallbackToCountryFilter(
  supabase: Awaited<ReturnType<typeof createClient>>,
  searchParams: URLSearchParams
) {
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const limit = parseInt(searchParams.get('limit') || '10');

  let query = supabase
    .from('gems')
    .select(`
      *,
      media:gem_media(*)
    `)
    .eq('status', 'approved')
    .order('average_rating', { ascending: false })
    .limit(limit);

  if (country) {
    query = query.eq('country', country);
  }
  if (city) {
    query = query.ilike('city', `%${city}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch gems' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data || [],
    total: data?.length || 0,
    fallback: true,
  });
}

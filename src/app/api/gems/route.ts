import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GemFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: GemFilters = {
      category: searchParams.get('category') as GemFilters['category'],
      country: searchParams.get('country') || undefined,
      city: searchParams.get('city') || undefined,
      min_rating: searchParams.get('min_rating')
        ? parseFloat(searchParams.get('min_rating')!)
        : undefined,
      tier: searchParams.get('tier') as GemFilters['tier'],
      search: searchParams.get('search') || undefined,
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('gems')
      .select(
        `
        *,
        media:gem_media(*)
      `,
        { count: 'exact' }
      )
      .eq('status', 'approved')
      .order('tier', { ascending: false }) // Featured first
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.min_rating) {
      query = query.gte('average_rating', filters.min_rating);
    }

    if (filters.tier) {
      query = query.eq('tier', filters.tier);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching gems:', error);
      return NextResponse.json({ error: 'Failed to fetch gems' }, { status: 500 });
    }

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || (userData.role !== 'owner' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Only gem owners can create listings' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Create slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const { data: existingGem } = await supabase
      .from('gems')
      .select('id')
      .eq('slug', slug)
      .single();

    const finalSlug = existingGem ? `${slug}-${Date.now()}` : slug;

    // Create gem
    const { data: gem, error: gemError } = await supabase
      .from('gems')
      .insert({
        owner_id: user.id,
        name: body.name,
        slug: finalSlug,
        description: body.description,
        category: body.category,
        country: body.country,
        city: body.city,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        phone: body.phone,
        email: body.email,
        website: body.website,
        opening_hours: body.opening_hours,
        price_range: body.price_range,
        status: 'pending',
        tier: 'standard',
      })
      .select()
      .single();

    if (gemError) {
      console.error('Error creating gem:', gemError);
      return NextResponse.json(
        { error: 'Failed to create gem' },
        { status: 500 }
      );
    }

    // Add media if provided
    if (body.media && body.media.length > 0) {
      const mediaInserts = body.media.map(
        (m: { url: string; type: string; is_cover: boolean }, index: number) => ({
          gem_id: gem.id,
          url: m.url,
          type: m.type || 'image',
          is_cover: m.is_cover || index === 0,
          order: index,
        })
      );

      const { error: mediaError } = await supabase
        .from('gem_media')
        .insert(mediaInserts);

      if (mediaError) {
        console.error('Error adding media:', mediaError);
        // Don't fail the whole request, gem was created
      }
    }

    return NextResponse.json({ data: gem }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

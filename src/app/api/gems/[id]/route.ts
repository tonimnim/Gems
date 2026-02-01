import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if id is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = supabase
      .from('gems')
      .select(
        `
        *,
        media:gem_media(*),
        owner:profiles(id, full_name, avatar_url),
        ratings(
          id,
          score,
          comment,
          created_at,
          user:profiles(id, full_name, avatar_url)
        )
      `
      );

    // Query by ID or slug
    const { data: gem, error } = await (isUUID
      ? query.eq('id', id)
      : query.eq('slug', id)
    ).single();

    if (error || !gem) {
      return NextResponse.json({ error: 'Gem not found' }, { status: 404 });
    }

    // Check if gem is approved or user is owner/admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (gem.status !== 'approved') {
      if (!user) {
        return NextResponse.json({ error: 'Gem not found' }, { status: 404 });
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isOwner = gem.owner_id === user.id;
      const isAdmin = userData?.role === 'admin';

      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Gem not found' }, { status: 404 });
      }
    }

    // Increment view count (don't await to avoid blocking response)
    // Use gem.id (UUID) not id (which could be slug)
    supabase
      .from('gems')
      .update({ views_count: gem.views_count + 1 })
      .eq('id', gem.id)
      .then(() => {});

    return NextResponse.json({ data: gem });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the gem
    const { data: gem, error: gemError } = await supabase
      .from('gems')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (gemError || !gem) {
      return NextResponse.json({ error: 'Gem not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOwner = gem.owner_id === user.id;
    const isAdmin = userData?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Admin can update status, tier, rejection_reason
    // Owner can update other fields
    const allowedFields = isAdmin
      ? [
          'name',
          'description',
          'category',
          'country',
          'city',
          'address',
          'latitude',
          'longitude',
          'phone',
          'email',
          'website',
          'opening_hours',
          'price_range',
          'status',
          'tier',
          'rejection_reason',
          'current_term_start',
          'current_term_end',
        ]
      : [
          'name',
          'description',
          'category',
          'country',
          'city',
          'address',
          'latitude',
          'longitude',
          'phone',
          'email',
          'website',
          'opening_hours',
          'price_range',
        ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If owner updates, reset status to pending for re-review
    if (!isAdmin && Object.keys(updateData).length > 0) {
      updateData.status = 'pending';
    }

    const { data: updatedGem, error: updateError } = await supabase
      .from('gems')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating gem:', updateError);
      return NextResponse.json(
        { error: 'Failed to update gem' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedGem });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the gem
    const { data: gem, error: gemError } = await supabase
      .from('gems')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (gemError || !gem) {
      return NextResponse.json({ error: 'Gem not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOwner = gem.owner_id === user.id;
    const isAdmin = userData?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('gems')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting gem:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete gem' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Gem deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

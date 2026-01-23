import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gemId: string }> }
) {
  try {
    const { gemId } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('ratings')
      .select(
        `
        *,
        user:users(id, full_name, avatar_url)
      `,
        { count: 'exact' }
      )
      .eq('gem_id', gemId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching ratings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ratings' },
        { status: 500 }
      );
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gemId: string }> }
) {
  try {
    const { gemId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if gem exists and is approved
    const { data: gem, error: gemError } = await supabase
      .from('gems')
      .select('id, status')
      .eq('id', gemId)
      .single();

    if (gemError || !gem) {
      return NextResponse.json({ error: 'Gem not found' }, { status: 404 });
    }

    if (gem.status !== 'approved') {
      return NextResponse.json(
        { error: 'Cannot rate a gem that is not approved' },
        { status: 400 }
      );
    }

    // Check if user already rated this gem
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('gem_id', gemId)
      .eq('user_id', user.id)
      .single();

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this gem' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate score
    const score = parseInt(body.score);
    if (isNaN(score) || score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 5' },
        { status: 400 }
      );
    }

    const { data: rating, error: ratingError } = await supabase
      .from('ratings')
      .insert({
        gem_id: gemId,
        user_id: user.id,
        score,
        comment: body.comment || null,
      })
      .select(
        `
        *,
        user:users(id, full_name, avatar_url)
      `
      )
      .single();

    if (ratingError) {
      console.error('Error creating rating:', ratingError);
      return NextResponse.json(
        { error: 'Failed to create rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: rating }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ gemId: string }> }
) {
  try {
    const { gemId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate score if provided
    if (body.score !== undefined) {
      const score = parseInt(body.score);
      if (isNaN(score) || score < 1 || score > 5) {
        return NextResponse.json(
          { error: 'Score must be between 1 and 5' },
          { status: 400 }
        );
      }
    }

    const { data: rating, error: ratingError } = await supabase
      .from('ratings')
      .update({
        score: body.score,
        comment: body.comment,
      })
      .eq('gem_id', gemId)
      .eq('user_id', user.id)
      .select(
        `
        *,
        user:users(id, full_name, avatar_url)
      `
      )
      .single();

    if (ratingError) {
      console.error('Error updating rating:', ratingError);
      return NextResponse.json(
        { error: 'Failed to update rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: rating });
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
  { params }: { params: Promise<{ gemId: string }> }
) {
  try {
    const { gemId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: deleteError } = await supabase
      .from('ratings')
      .delete()
      .eq('gem_id', gemId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting rating:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error.message);
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ user: null });
  }
}

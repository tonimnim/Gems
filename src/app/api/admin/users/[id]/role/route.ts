import { NextRequest, NextResponse } from 'next/server';
import { updateUserRole } from '@/lib/api/admin';
import { requireAdmin } from '@/lib/api/admin-auth';
import type { UserRole } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const { role } = body as { role: UserRole };

    if (!role || !['owner', 'admin', 'visitor'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role provided' },
        { status: 400 }
      );
    }

    const result = await updateUserRole(id, role);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

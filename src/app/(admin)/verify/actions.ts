'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function approveGem(gemId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('gems')
    .update({
      status: 'approved',
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gemId);

  if (error) {
    console.error('Error approving gem:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/verify');
  return { success: true };
}

export async function rejectGem(gemId: string, reason: string, notes: string) {
  const supabase = await createClient();

  const rejectionReason = notes ? `${reason}: ${notes}` : reason;

  const { error } = await supabase
    .from('gems')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gemId);

  if (error) {
    console.error('Error rejecting gem:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/verify');
  return { success: true };
}

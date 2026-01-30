'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { FREE_TRIAL } from '@/constants';

export async function approveGem(gemId: string) {
  const supabase = await createClient();

  // Get gem details first (for notification)
  const { data: gem, error: fetchError } = await supabase
    .from('gems')
    .select('id, name, owner_id')
    .eq('id', gemId)
    .single();

  if (fetchError || !gem) {
    console.error('Error fetching gem:', fetchError);
    return { success: false, error: 'Gem not found' };
  }

  // Calculate trial end date if free trial is enabled
  const trialEndDate = FREE_TRIAL.enabled
    ? new Date(Date.now() + FREE_TRIAL.days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Update gem status (and set trial period if enabled)
  const { error } = await supabase
    .from('gems')
    .update({
      status: 'approved',
      rejection_reason: null,
      updated_at: new Date().toISOString(),
      ...(trialEndDate && { current_term_end: trialEndDate }),
    })
    .eq('id', gemId);

  if (error) {
    console.error('Error approving gem:', error);
    return { success: false, error: error.message };
  }

  // Send notification to owner
  if (FREE_TRIAL.enabled) {
    // Free trial notification - gem is live immediately
    await supabase.from('notifications').insert({
      user_id: gem.owner_id,
      type: 'gem_approved',
      title: 'Your Gem is Now Live!',
      message: `Great news! "${gem.name}" has been approved and is now visible to the public. You have a ${FREE_TRIAL.days}-day free trial.`,
      data: {
        gem_id: gem.id,
        gem_name: gem.name,
        action_url: `/gem/${gem.id}`,
      },
    });
  } else {
    // Payment required notification
    await supabase.from('notifications').insert({
      user_id: gem.owner_id,
      type: 'gem_approved',
      title: 'Your Gem is Approved!',
      message: `Great news! "${gem.name}" has been approved. Complete payment to make it visible to the public.`,
      data: {
        gem_id: gem.id,
        gem_name: gem.name,
        action_url: `/gems/${gem.id}/pay`,
      },
    });
  }

  revalidatePath('/admin/verify');
  return { success: true };
}

export async function rejectGem(gemId: string, reason: string, notes: string) {
  const supabase = await createClient();

  // Get gem details first (for notification)
  const { data: gem, error: fetchError } = await supabase
    .from('gems')
    .select('id, name, owner_id')
    .eq('id', gemId)
    .single();

  if (fetchError || !gem) {
    console.error('Error fetching gem:', fetchError);
    return { success: false, error: 'Gem not found' };
  }

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

  // Send notification to owner about rejection
  await supabase.from('notifications').insert({
    user_id: gem.owner_id,
    type: 'gem_rejected',
    title: 'Gem Not Approved',
    message: `Unfortunately, "${gem.name}" was not approved. Reason: ${rejectionReason}`,
    data: {
      gem_id: gem.id,
      gem_name: gem.name,
      rejection_reason: rejectionReason,
    },
  });

  revalidatePath('/admin/verify');
  return { success: true };
}

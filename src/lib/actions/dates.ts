'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { CreateDateInput, UpdateDateInput, DateEntry } from '@/types/database';

async function getCoupleId(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single();

  return profile?.couple_id || null;
}

export async function getDates(): Promise<DateEntry[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const coupleId = await getCoupleId();
  if (!coupleId) return [];

  const { data, error } = await supabase
    .from('dates')
    .select('*')
    .eq('couple_id', coupleId)
    .order('date_timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching dates:', error);
    return [];
  }

  return data || [];
}

export async function getUpcomingDates(): Promise<DateEntry[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const coupleId = await getCoupleId();
  if (!coupleId) return [];

  const { data, error } = await supabase
    .from('dates')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('is_completed', false)
    .gte('date_timestamp', new Date().toISOString())
    .order('date_timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming dates:', error);
    return [];
  }

  return data || [];
}

export async function getCompletedDates(): Promise<DateEntry[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const coupleId = await getCoupleId();
  if (!coupleId) return [];

  const { data, error } = await supabase
    .from('dates')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('is_completed', true)
    .order('date_timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching completed dates:', error);
    return [];
  }

  return data || [];
}

export async function createDate(input: CreateDateInput): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const coupleId = await getCoupleId();
  if (!coupleId) {
    return { success: false, error: 'Not authenticated or no couple found' };
  }

  const { error } = await supabase
    .from('dates')
    .insert({
      couple_id: coupleId,
      title: input.title,
      category: input.category,
      date_timestamp: input.date_timestamp,
    });

  if (error) {
    console.error('Error creating date:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function updateDate(input: UpdateDateInput): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const coupleId = await getCoupleId();
  if (!coupleId) {
    return { success: false, error: 'Not authenticated or no couple found' };
  }

  const { id, ...updateData } = input;
  
  const { error } = await supabase
    .from('dates')
    .update(updateData)
    .eq('id', id)
    .eq('couple_id', coupleId);

  if (error) {
    console.error('Error updating date:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/memories');
  return { success: true };
}

export async function deleteDate(id: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const coupleId = await getCoupleId();
  if (!coupleId) {
    return { success: false, error: 'Not authenticated or no couple found' };
  }

  const { error } = await supabase
    .from('dates')
    .delete()
    .eq('id', id)
    .eq('couple_id', coupleId);

  if (error) {
    console.error('Error deleting date:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/memories');
  return { success: true };
}

export async function toggleComplete(id: string, isCompleted: boolean): Promise<{ success: boolean; error?: string }> {
  return updateDate({ id, is_completed: isCompleted });
}

export async function completeWithPhoto(
  id: string, 
  photoUrl: string, 
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  return updateDate({ 
    id, 
    is_completed: true, 
    photo_url: photoUrl,
    notes: notes || undefined 
  });
}

export async function getCoupleInfo() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id, display_name')
    .eq('id', user.id)
    .single();

  if (!profile?.couple_id) return null;

  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('id', profile.couple_id)
    .single();

  return {
    coupleId: profile.couple_id,
    displayName: profile.display_name,
    anniversaryDate: couple?.anniversary_date,
    partner1Name: couple?.partner1_name,
    partner2Name: couple?.partner2_name,
    profilePhotoUrl: couple?.profile_photo_url,
  };
}

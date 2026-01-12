'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function uploadPhoto(formData: FormData): Promise<{ url: string | null; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const file = formData.get('file') as File;
  
  if (!file) {
    return { url: null, error: 'No file provided' };
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { url: null, error: 'File must be an image' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: 'File must be less than 5MB' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { url: null, error: 'Not authenticated' };
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('date-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { url: null, error: 'Failed to upload image' };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('date-photos')
    .getPublicUrl(fileName);

  return { url: publicUrl };
}

export async function deletePhoto(photoUrl: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Extract path from URL
  const urlParts = photoUrl.split('/date-photos/');
  if (urlParts.length < 2) {
    return { success: false, error: 'Invalid photo URL' };
  }

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from('date-photos')
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'Failed to delete image' };
  }

  return { success: true };
}

export async function uploadCouplePhoto(formData: FormData): Promise<{ url: string | null; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const file = formData.get('file') as File;
  
  if (!file) {
    return { url: null, error: 'No file provided' };
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { url: null, error: 'File must be an image' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: 'File must be less than 5MB' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { url: null, error: 'Not authenticated' };
  }

  // Get the user's couple_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single();

  if (!profile?.couple_id) {
    return { url: null, error: 'No couple found' };
  }

  // Generate unique filename for couple profile photo
  const fileExt = file.name.split('.').pop();
  const fileName = `couple-profiles/${profile.couple_id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('date-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { url: null, error: 'Failed to upload image' };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('date-photos')
    .getPublicUrl(fileName);

  // Update the couples table with the new photo URL
  const { error: updateError } = await supabase
    .from('couples')
    .update({ profile_photo_url: publicUrl })
    .eq('id', profile.couple_id);

  if (updateError) {
    console.error('Update error:', updateError);
    return { url: null, error: 'Failed to save profile photo' };
  }

  return { url: publicUrl };
}

export async function deleteCouplePhoto(): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get the user's couple_id and current photo
  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single();

  if (!profile?.couple_id) {
    return { success: false, error: 'No couple found' };
  }

  const { data: couple } = await supabase
    .from('couples')
    .select('profile_photo_url')
    .eq('id', profile.couple_id)
    .single();

  if (couple?.profile_photo_url) {
    // Extract path from URL and delete from storage
    const urlParts = couple.profile_photo_url.split('/date-photos/');
    if (urlParts.length >= 2) {
      await supabase.storage
        .from('date-photos')
        .remove([urlParts[1]]);
    }
  }

  // Update the couples table to remove the photo URL
  const { error: updateError } = await supabase
    .from('couples')
    .update({ profile_photo_url: null })
    .eq('id', profile.couple_id);

  if (updateError) {
    console.error('Update error:', updateError);
    return { success: false, error: 'Failed to remove profile photo' };
  }

  return { success: true };
}

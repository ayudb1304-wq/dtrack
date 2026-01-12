import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getCompletedDates, getCoupleInfo } from '@/lib/actions/dates';
import { CollageClient } from './CollageClient';
import { redirect } from 'next/navigation';

export default async function CollagePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const [completedDates, coupleInfo] = await Promise.all([
    getCompletedDates(),
    getCoupleInfo(),
  ]);

  if (!coupleInfo?.coupleId) {
    redirect('/setup');
  }

  return (
    <CollageClient 
      initialDates={completedDates}
      coupleInfo={coupleInfo}
    />
  );
}

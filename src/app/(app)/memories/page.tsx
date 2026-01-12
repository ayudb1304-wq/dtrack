import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getCompletedDates, getCoupleInfo } from '@/lib/actions/dates';
import { MemoriesClient } from './MemoriesClient';
import { redirect } from 'next/navigation';

export default async function MemoriesPage() {
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
    <MemoriesClient 
      initialDates={completedDates}
      coupleId={coupleInfo.coupleId}
    />
  );
}

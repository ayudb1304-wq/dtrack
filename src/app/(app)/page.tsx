import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getDates, getCoupleInfo } from '@/lib/actions/dates';
import { DashboardClient } from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const [dates, coupleInfo] = await Promise.all([
    getDates(),
    getCoupleInfo(),
  ]);

  if (!coupleInfo?.coupleId) {
    redirect('/setup');
  }

  return (
    <DashboardClient 
      initialDates={dates} 
      coupleInfo={coupleInfo}
    />
  );
}

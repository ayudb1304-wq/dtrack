'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { DateEntry } from '@/types/database';

export function useRealtimeDates(coupleId: string | null, initialDates: DateEntry[] = []) {
  const [dates, setDates] = useState<DateEntry[]>(initialDates);
  const supabase = createClient();

  const refreshDates = useCallback(async () => {
    if (!coupleId) return;
    
    const { data } = await supabase
      .from('dates')
      .select('*')
      .eq('couple_id', coupleId)
      .order('date_timestamp', { ascending: true });
    
    if (data) {
      setDates(data);
    }
  }, [coupleId, supabase]);

  useEffect(() => {
    if (!coupleId) return;

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`dates-${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dates',
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDates((prev) => [...prev, payload.new as DateEntry].sort(
              (a, b) => new Date(a.date_timestamp).getTime() - new Date(b.date_timestamp).getTime()
            ));
          } else if (payload.eventType === 'UPDATE') {
            setDates((prev) =>
              prev.map((date) =>
                date.id === payload.new.id ? (payload.new as DateEntry) : date
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setDates((prev) =>
              prev.filter((date) => date.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, supabase]);

  const upcomingDates = dates.filter(
    (date) => !date.is_completed && new Date(date.date_timestamp) >= new Date()
  );

  const completedDates = dates.filter((date) => date.is_completed);

  return { 
    dates, 
    upcomingDates, 
    completedDates, 
    refreshDates,
    setDates 
  };
}

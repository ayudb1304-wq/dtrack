export type DateCategory = 'Chai' | 'Restaurant' | 'Home' | 'Walk' | 'Surprise';

export interface DateEntry {
  id: string;
  created_at: string;
  couple_id: string;
  title: string;
  category: DateCategory;
  date_timestamp: string;
  photo_url: string | null;
  notes: string | null;
  is_completed: boolean;
}

export interface CreateDateInput {
  title: string;
  category: DateCategory;
  date_timestamp: string;
}

export interface UpdateDateInput {
  id: string;
  title?: string;
  category?: DateCategory;
  date_timestamp?: string;
  photo_url?: string;
  notes?: string;
  is_completed?: boolean;
}

export interface CoupleProfile {
  id: string;
  user_id: string;
  couple_id: string;
  partner_name: string;
  anniversary_date: string;
  created_at: string;
}

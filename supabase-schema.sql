-- ============================================
-- Us - Date Planner PWA Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COUPLES TABLE (for linking two users)
-- ============================================
CREATE TABLE couples (
  id text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  anniversary_date date,
  partner1_name text,
  partner2_name text
);

-- Enable RLS on couples
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER PROFILES TABLE (links users to couples)
-- ============================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id text REFERENCES couples(id),
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- DATES TABLE
-- ============================================
CREATE TABLE dates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  couple_id text NOT NULL REFERENCES couples(id),
  title text NOT NULL,
  category text CHECK (category IN ('Chai', 'Restaurant', 'Home', 'Walk', 'Surprise')),
  date_timestamp timestamptz NOT NULL,
  photo_url text,
  notes text,
  is_completed boolean DEFAULT false
);

-- Enable RLS on dates
ALTER TABLE dates ENABLE ROW LEVEL SECURITY;

-- Dates policies - users can only access their couple's dates
CREATE POLICY "Users can view couple dates" ON dates
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert couple dates" ON dates
  FOR INSERT WITH CHECK (
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update couple dates" ON dates
  FOR UPDATE USING (
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete couple dates" ON dates
  FOR DELETE USING (
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================
-- STORAGE BUCKET FOR PHOTOS
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('date-photos', 'date-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'date-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'date-photos');

CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'date-photos' AND
    auth.role() = 'authenticated'
  );

-- ============================================
-- REALTIME SETUP
-- ============================================
-- Enable realtime for dates table
ALTER PUBLICATION supabase_realtime ADD TABLE dates;

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

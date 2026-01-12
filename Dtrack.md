📄 Product Requirements Document (PRD)

1. Product Overview
   Project Name: Us (Our Date Planner) Objective: A private, shared PWA for a couple to plan 2-3 intentional dates per month, document them with photos, and celebrate their relationship with a monthly visual report. Target Users: You and your girlfriend.

2. Core Features
   A. Shared Authentication & Privacy
   Simple Login: Secure login via Email/Magic Link (Supabase Auth).

Shared Space: Both users are linked to a single "Couple ID" to see and edit the same data.

B. Date Planner (The "Future" Tab)
Add Date: Form to input Date Name, Type (Home, Chai, Out, Surprise), and Date/Time.

Edit/Delete: Ability to reschedule or change plans.

Status Toggle: Mark a date as "Planned" or "Completed."

C. Memory Vault (The "Past" Tab)
Photo Upload: For every completed date, users can upload one "hero" photo.

Captioning: A small text area to note a favorite memory from that specific date.

D. Monthly Collage Report
Automatic Generation: At the end of the month, the app compiles all "Completed" dates into a stylized collage.

Theme: "Polaroid" or "Scrapbook" aesthetic.

Sharing: A button to save the collage as an image.

3. Technical Requirements
   PWA: Must be installable on iOS/Android (Offline manifests, icons).

Real-time: Updates made by one person should reflect on the other’s phone immediately.

Storage: Secure storage for images (Supabase Storage).

🏗 Development Plan
Phase 1: Foundation (Days 1-2)
Setup: Initialize Next.js 14+ (App Router) and Tailwind CSS.

Supabase Setup: \* Create dates table (id, couple_id, title, type, date, photo_url, notes, is_completed).

Configure Row Level Security (RLS) so only your couple_id can see your data.

Auth: Implement a simple login page.

Phase 2: The Functional App (Days 3-5)
Dashboard: Create a mobile-first list view of upcoming dates.

Date Entry: Build the "Add Date" modal/form.

State Management: Ensure that when you add a date, it appears on her screen (Supabase Realtime).

Phase 3: Media & Memories (Days 6-8)
Image Handling: Integrate Supabase Storage. Allow users to click a "Complete Date" button which triggers a photo upload.

The Collage Logic: Use canvas or the html-to-image library to layout the month's photos into a 2x2 or 3x3 grid with a "January 2026" header.

Phase 4: PWA & Polish (Days 9-10)
PWA Setup: Configure next-pwa to generate the manifest.json and service workers.

UI/UX Refinement: \* Add "Haptic Feedback" (if possible) or smooth transitions.

Implement a "Relationship Counter" (e.g., "Day 450 together").

Deployment: Deploy to Vercel and "Add to Home Screen" on both devices.

💾 Proposed Database Schema (SQL)
You can run this directly in the Supabase SQL Editor:

SQL

CREATE TABLE dates (
id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
created_at timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
couple_id text NOT NULL, -- A shared unique key for both of you
title text NOT NULL,
category text CHECK (category IN ('Chai', 'Restaurant', 'Home', 'Walk', 'Surprise')),
date_timestamp timestamp NOT NULL,
photo_url text,
notes text,
is_completed boolean DEFAULT false
);
🎨 UI/UX Direction
Colors: Soft Rose (#F43F5E), Warm Cream (#FFFBEB), and Charcoal for text.

Typography: A clean Sans-serif (Inter) for the app, and a "Handwritten" font for the Monthly Collage report to give it a personal feel.

Interaction: Use "Cards" for dates. Swiping left could mark a date as "Completed."

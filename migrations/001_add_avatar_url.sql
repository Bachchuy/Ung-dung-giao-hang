-- Migration: add avatar_url to profiles/users
-- Run this against your Supabase/Postgres database

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Enable RLS if not already
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: allow users to update their own profile (including avatar_url)
CREATE POLICY IF NOT EXISTS allow_update_own ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: adjust schema/table names if your project uses 'users' instead of 'profiles'.
-- Also ensure a storage bucket named 'avatars' exists in Supabase Storage.

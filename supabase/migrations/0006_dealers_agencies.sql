-- Migration: 0006_dealers_agencies.sql
-- Add account_type to profiles and listed_by_type to properties
-- Replace handle_new_user to capture account_type from raw_meta_data

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'user';

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS listed_by_type TEXT DEFAULT 'owner';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, account_type)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    'user',
    COALESCE(new.raw_user_meta_data->>'account_type', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

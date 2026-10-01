-- Migration: 0003_settings.sql
-- Create platform_settings table for dynamic configurations

CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed defaults
INSERT INTO platform_settings (key, value, description)
VALUES 
  ('property_listing_limit', '5', 'Maximum number of active listings standard users can have')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Settings are viewable by everyone." 
ON platform_settings FOR SELECT USING (true);

-- Allow only admins to manage settings
CREATE POLICY "Admins can manage settings." 
ON platform_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

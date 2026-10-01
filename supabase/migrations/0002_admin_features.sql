-- Migration: 0002_admin_features.sql
-- Add verified badge and seed major cities

-- 1. Add is_verified to properties
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Seed Locations (Major Cities) skipping if they exist
INSERT INTO locations (city)
SELECT city FROM (VALUES
  ('Islamabad'), 
  ('Rawalpindi'), 
  ('Lahore'), 
  ('Multan'), 
  ('Sialkot'), 
  ('Faisalabad'),
  ('Karachi'), 
  ('Hyderabad'), 
  ('Quetta'), 
  ('Gawadar'), 
  ('Peshawar'), 
  ('Gilgit'),
  ('Skardu'), 
  ('Hunza'), 
  ('Mirpur'), 
  ('Murree')
) AS v(city)
WHERE NOT EXISTS (
  SELECT 1 FROM locations l WHERE l.city = v.city
);

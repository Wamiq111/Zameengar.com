-- Migration: 0004_ad_id.sql
-- Add an auto-incrementing ad_id column to properties

-- By using GENERATED ALWAYS AS IDENTITY optionally or SERIAL, Postgres gives us a guaranteed unique auto-incrementing integer.
-- We will use SERIAL for simplicity and compatibility with older Postgres versions.
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS ad_id SERIAL UNIQUE;

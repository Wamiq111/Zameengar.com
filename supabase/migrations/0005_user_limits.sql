-- Migration: 0005_user_limits.sql
-- Add property_limit_override column to profiles

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS property_limit_override INTEGER DEFAULT NULL;

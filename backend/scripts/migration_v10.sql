-- Phase 10 Migration: User Profile Image
USE dryfruit_hub_db;

-- Add profile_image column to users table
ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) AFTER phone;

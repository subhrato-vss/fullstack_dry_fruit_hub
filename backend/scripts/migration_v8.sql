-- Phase 8 Migration: AI Content Management Fields
USE dryfruit_hub_db;

-- Add AI context fields to products table
ALTER TABLE products 
ADD COLUMN health_benefits TEXT AFTER description,
ADD COLUMN nutrition_info TEXT AFTER health_benefits,
ADD COLUMN recommended_intake TEXT AFTER nutrition_info,
ADD COLUMN ai_context_notes TEXT AFTER recommended_intake;

-- Update existing data with some default values if needed 
-- (Optional: We'll leave them NULL so the AI can fallback to category-level MOCK_DATA)

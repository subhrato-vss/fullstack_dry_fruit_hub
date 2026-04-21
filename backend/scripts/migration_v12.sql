-- Phase 12 Migration: Order Tracking Status
USE dryfruit_hub_db;

-- 1. Add order_status column to orders table
ALTER TABLE orders 
ADD COLUMN order_status ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Processing' 
AFTER payment_status;

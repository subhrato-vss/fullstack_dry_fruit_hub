-- Phase 11 Migration: Advanced Checkout & Payments
USE dryfruit_hub_db;

-- 1. Update Orders Table with additional fields
ALTER TABLE orders 
RENAME COLUMN address_line TO address_line1;

ALTER TABLE orders
ADD COLUMN address_line2 VARCHAR(255) AFTER address_line1,
ADD COLUMN landmark VARCHAR(100) AFTER pincode;

-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255),
    payment_status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

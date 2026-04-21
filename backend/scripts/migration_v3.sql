-- Phase 3 Migration: Authentication Separation

USE dryfruit_hub_db;

-- 1. Update Users Table (Remove role, add phone)
-- Note: If data exists, we might need to migrate, but Phase 1/2 used dummy data.
ALTER TABLE users DROP COLUMN role;
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER password;

-- 2. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create User Addresses Table
CREATE TABLE IF NOT EXISTS user_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Seed Initial Admin Account
-- Password: Admin@123
INSERT IGNORE INTO admins (name, email, password) VALUES 
('System Admin', 'admin@dryfruithub.com', '$2b$10$ZmzZxaNrF0dmaSDO0AlhEerAHZaltxwRYMAjdMg8r.bDo8MJhvlXG');

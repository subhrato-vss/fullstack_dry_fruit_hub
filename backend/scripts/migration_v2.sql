-- Phase 2 Migration: Product Management

USE dryfruit_hub_db;

-- Add weight column to products
ALTER TABLE products ADD COLUMN weight VARCHAR(50);

-- Create Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Update existing products with dummy weights
UPDATE products SET weight = '500g' WHERE id = 1;
UPDATE products SET weight = '250g' WHERE id = 2;
UPDATE products SET weight = '1kg' WHERE id = 3;
UPDATE products SET weight = '500g' WHERE id = 4;
UPDATE products SET weight = '250g' WHERE id = 5;

-- Add Raisins category
INSERT IGNORE INTO categories (name, description) VALUES 
('Raisins', 'Sweet and sun-dried premium raisins');

-- Add some extra images for detail gallery
INSERT IGNORE INTO product_images (product_id, image_url) VALUES 
(1, 'https://images.unsplash.com/photo-1543158266-0066955047b1?auto=format&fit=crop&q=80&w=600'),
(1, 'https://images.unsplash.com/photo-1508013861974-9f63471c68e5?auto=format&fit=crop&q=80&w=600'),
(2, 'https://images.unsplash.com/photo-1596501048549-0648f95c808f?auto=format&fit=crop&q=80&w=600');

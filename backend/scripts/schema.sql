-- AI-Powered Dry Fruit E-Commerce Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS dryfruit_hub_db;
USE dryfruit_hub_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    stock_quantity INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed Initial Data
INSERT IGNORE INTO categories (name, description) VALUES 
('Almonds', 'Premium California and Mamra almonds'),
('Cashews', 'Whole and split premium cashews'),
('Walnuts', 'Rich and buttery walnut kernels'),
('Pistachios', 'Roasted and salted Iranian pistachios'),
('Dates', 'Sweet and nutritious Medjool dates');

INSERT IGNORE INTO products (category_id, name, description, price, stock_quantity, image_url) VALUES 
(1, 'California Almonds', 'High-quality roasted California almonds.', 850.00, 100, 'https://images.unsplash.com/photo-1508817628294-5a453fa11124?auto=format&fit=crop&q=80&w=400'),
(2, 'Premium Cashews', 'Smooth and creamy whole cashews.', 720.00, 50, 'https://images.unsplash.com/photo-1596501048549-0648f95c808f?auto=format&fit=crop&q=80&w=400'),
(3, 'Walnut Kernels', 'Heart-healthy walnut halves.', 980.00, 30, 'https://images.unsplash.com/photo-1509912760195-23136209f9f5?auto=format&fit=crop&q=80&w=400'),
(4, 'Roasted Pistachios', 'Crispy and salty roasted pistachios.', 1100.00, 80, 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&q=80&w=400'),
(5, 'Medjool Dates', 'Organic king-sized sweet dates.', 450.00, 120, 'https://images.unsplash.com/photo-1591873336750-681b92019777?auto=format&fit=crop&q=80&w=400');

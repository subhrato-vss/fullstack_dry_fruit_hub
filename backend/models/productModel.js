import { query } from '../config/db.js';

/**
 * Fetch all products with optional category and search filters.
 */
export const getAllProducts = async (categoryId, searchQuery, sort = 'newest') => {
    let sql = `
        SELECT p.*, c.name as category_name, i.available_stock,
               AVG(r.rating) as avg_rating, COUNT(r.id) as review_count,
               COUNT(od.id) as order_count
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN inventory i ON p.id = i.product_id
        LEFT JOIN reviews r ON p.id = r.product_id
        LEFT JOIN order_details od ON p.id = od.product_id
        WHERE 1=1
    `;
    const params = [];

    if (categoryId) {
        sql += ' AND p.category_id = ?';
        params.push(categoryId);
    }

    if (searchQuery) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.health_benefits LIKE ?)';
        const searchParam = `%${searchQuery}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    sql += ' GROUP BY p.id';

    // Apply sorting
    switch (sort) {
        case 'price_asc':
            sql += ' ORDER BY p.price ASC';
            break;
        case 'price_desc':
            sql += ' ORDER BY p.price DESC';
            break;
        case 'popular':
            sql += ' ORDER BY order_count DESC';
            break;
        case 'newest':
        default:
            sql += ' ORDER BY p.created_at DESC';
    }

    return await query(sql, params);
};

/**
 * Fetch a single product by ID, including its category name and associated images.
 */
export const getProductById = async (id) => {
    // Fetch product details
    const productResults = await query(`
        SELECT p.*, c.name as category_name, i.available_stock,
               AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN inventory i ON p.id = i.product_id
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.id = ?
        GROUP BY p.id
    `, [id]);
    
    if (productResults.length === 0) return null;

    const product = productResults[0];

    // Fetch associated images
    const imageResults = await query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);
    
    // Combine main image with others
    product.images = [product.image_url, ...imageResults.map(img => img.image_url)];
    
    return product;
};

export const getCategories = async () => {
    return await query(`
        SELECT c.*, COUNT(p.id) as product_count 
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.name ASC
    `);
};

export const getRelatedProducts = async (id, categoryId) => {
    const sql = `
        SELECT p.*, c.name as category_name, i.available_stock,
               AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        LEFT JOIN inventory i ON p.id = i.product_id
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.category_id = ? AND p.id != ?
        GROUP BY p.id
        LIMIT 4
    `;
    return await query(sql, [categoryId, id]);
};

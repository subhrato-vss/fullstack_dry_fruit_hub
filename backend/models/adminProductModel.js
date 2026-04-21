import { query } from '../config/db.js';

export const createProduct = async (productData) => {
    const { 
        category_id, name, description, price, stock_quantity, weight, image_url, additional_images,
        health_benefits, nutrition_info, recommended_intake, ai_context_notes 
    } = productData;
    
    // Insert Product
    const result = await query(`
        INSERT INTO products (
            category_id, name, description, price, stock_quantity, weight, image_url,
            health_benefits, nutrition_info, recommended_intake, ai_context_notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        category_id, name, description, price, stock_quantity, weight, image_url,
        health_benefits, nutrition_info, recommended_intake, ai_context_notes
    ]);

    const productId = result.insertId;

    // Insert Additional Images if any
    if (additional_images && additional_images.length > 0) {
        for (const url of additional_images) {
            if (url.trim()) {
                await query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [productId, url]);
            }
        }
    }

    return productId;
};

export const updateProduct = async (id, productData) => {
    const { 
        category_id, name, description, price, stock_quantity, weight, image_url, additional_images,
        health_benefits, nutrition_info, recommended_intake, ai_context_notes 
    } = productData;

    // Update Product
    await query(`
        UPDATE products 
        SET category_id = ?, name = ?, description = ?, price = ?, stock_quantity = ?, weight = ?, image_url = ?,
            health_benefits = ?, nutrition_info = ?, recommended_intake = ?, ai_context_notes = ?
        WHERE id = ?
    `, [
        category_id, name, description, price, stock_quantity, weight, image_url,
        health_benefits, nutrition_info, recommended_intake, ai_context_notes, id
    ]);

    // Handle Additional Images: For simplicity, we clear and re-insert in this phase
    await query('DELETE FROM product_images WHERE product_id = ?', [id]);
    
    if (additional_images && additional_images.length > 0) {
        for (const url of additional_images) {
            if (url.trim()) {
                await query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [id, url]);
            }
        }
    }

    return true;
};

export const deleteProduct = async (id) => {
    return await query('DELETE FROM products WHERE id = ?', [id]);
};

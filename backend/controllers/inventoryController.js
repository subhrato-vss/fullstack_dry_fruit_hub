import { query } from '../config/db.js';

export const getInventory = async (req, res, next) => {
    try {
        const sql = `
            SELECT i.*, p.name, p.image_url, p.weight, c.name as category_name
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            ORDER BY i.available_stock ASC
        `;
        const inventory = await query(sql);
        res.json(inventory);
    } catch (error) {
        next(error);
    }
};

export const updateStock = async (req, res, next) => {
    try {
        const { product_id: productId, available_stock } = req.body;
        
        const sql = `
            UPDATE inventory 
            SET available_stock = ? 
            WHERE product_id = ?
        `;
        await query(sql, [available_stock, productId]);
        
        // Also sync back to products table for legacy compatibility
        await query('UPDATE products SET stock_quantity = ? WHERE id = ?', [available_stock, productId]);

        res.json({ message: 'Stock updated successfully.' });
    } catch (error) {
        next(error);
    }
};

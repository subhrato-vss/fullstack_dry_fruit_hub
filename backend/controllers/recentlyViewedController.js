import { query } from '../config/db.js';

export const trackView = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user_id = req.user.id;

        // Upsert logic: INSERT ... ON DUPLICATE KEY UPDATE
        // This keeps the 'viewed_at' fresh
        const sql = `
            INSERT INTO recently_viewed (user_id, product_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP
        `;
        await query(sql, [user_id, productId]);
        res.status(200).json({ message: 'Product view tracked' });
    } catch (error) {
        next(error);
    }
};

export const getRecentlyViewed = async (req, res, next) => {
    try {
        const sql = `
            SELECT rv.viewed_at, p.*, c.name as category_name, i.available_stock
            FROM recently_viewed rv
            JOIN products p ON rv.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE rv.user_id = ?
            ORDER BY rv.viewed_at DESC
            LIMIT 5
        `;
        const products = await query(sql, [req.user.id]);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

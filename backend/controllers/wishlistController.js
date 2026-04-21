import { query } from '../config/db.js';

export const getWishlist = async (req, res, next) => {
    try {
        const sql = `
            SELECT w.id as wishlist_id, p.*, c.name as category_name, i.available_stock
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE w.user_id = ?
        `;
        const items = await query(sql, [req.user.id]);
        res.json(items);
    } catch (error) {
        next(error);
    }
};

export const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const sql = 'INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)';
        await query(sql, [req.user.id, productId]);
        res.status(201).json({ message: 'Product added to wishlist' });
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM wishlist WHERE id = ? AND user_id = ?';
        await query(sql, [id, req.user.id]);
        res.json({ message: 'Product removed from wishlist' });
    } catch (error) {
        next(error);
    }
};

import { query } from '../config/db.js';

export const addReview = async (req, res, next) => {
    try {
        const { product_id, rating, review_text } = req.body;
        const user_id = req.user.id;

        // 1. Check if user is a verified purchaser
        const purchaseSql = `
            SELECT o.id 
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            WHERE o.user_id = ? AND od.product_id = ? AND o.payment_status = 'Paid'
            LIMIT 1
        `;
        const purchases = await query(purchaseSql, [user_id, product_id]);

        if (purchases.length === 0) {
            return res.status(403).json({ message: 'Only verified purchasers can review this product.' });
        }

        // 2. Add Review
        const sql = `
            INSERT INTO reviews (user_id, product_id, rating, review_text) 
            VALUES (?, ?, ?, ?)
        `;
        await query(sql, [user_id, product_id, rating, review_text]);

        res.status(201).json({ message: 'Review submitted successfully.' });
    } catch (error) {
        next(error);
    }
};

export const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const sql = `
            SELECT r.*, u.name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `;
        const reviews = await query(sql, [productId]);
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Only admin can delete reviews (moderation)
        const sql = 'DELETE FROM reviews WHERE id = ?';
        await query(sql, [id]);
        res.json({ message: 'Review deleted by administrator.' });
    } catch (error) {
        next(error);
    }
};

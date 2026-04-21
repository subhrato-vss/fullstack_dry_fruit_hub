import { query } from '../config/db.js';

export const addReview = async (req, res, next) => {
    try {
        const { product_id, rating, review_text } = req.body;
        const user_id = req.user.id;

        // 1. Strict Eligibility Check: Must have a Delivered order containing this product
        const purchaseSql = `
            SELECT o.id 
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            WHERE o.user_id = ? AND od.product_id = ? AND o.order_status = 'Delivered'
            LIMIT 1
        `;
        const purchases = await query(purchaseSql, [user_id, product_id]);

        if (purchases.length === 0) {
            return res.status(403).json({ message: 'You can only review products from delivered orders.' });
        }

        // 2. Check if already reviewed (Prevent duplicates)
        const existingSql = 'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?';
        const existing = await query(existingSql, [user_id, product_id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this product. Please edit your existing review.' });
        }

        // 3. Add Review
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

export const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, review_text } = req.body;
        const user_id = req.user.id;

        // Check ownership
        const checkSql = 'SELECT id FROM reviews WHERE id = ? AND user_id = ?';
        const review = await query(checkSql, [id, user_id]);
        if (review.length === 0) {
            return res.status(403).json({ message: 'You can only edit your own reviews.' });
        }

        const sql = 'UPDATE reviews SET rating = ?, review_text = ? WHERE id = ?';
        await query(sql, [rating, review_text, id]);

        res.json({ message: 'Review updated successfully.' });
    } catch (error) {
        next(error);
    }
};

export const checkReviewEligibility = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const user_id = req.user.id;

        // 1. Check if purchased and delivered
        const purchaseSql = `
            SELECT o.id 
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            WHERE o.user_id = ? AND od.product_id = ? AND o.order_status = 'Delivered'
            LIMIT 1
        `;
        const purchases = await query(purchaseSql, [user_id, productId]);
        const isEligible = purchases.length > 0;

        // 2. Check for existing review
        const existingSql = 'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?';
        const existing = await query(existingSql, [user_id, productId]);
        const review = existing.length > 0 ? existing[0] : null;

        res.json({
            isEligible,
            alreadyReviewed: !!review,
            review
        });
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

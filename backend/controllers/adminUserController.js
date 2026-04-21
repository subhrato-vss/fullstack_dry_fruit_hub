import { query } from '../config/db.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const sql = `
            SELECT id, name, email, phone, created_at 
            FROM users 
            ORDER BY created_at DESC
        `;
        const users = await query(sql);
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const getUserOrderHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT id, total_amount, order_status, payment_status, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;
        const orders = await query(sql, [id]);
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

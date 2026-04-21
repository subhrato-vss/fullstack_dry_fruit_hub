import { query } from '../config/db.js';

export const getAllOrders = async (req, res, next) => {
    try {
        const sql = `
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `;
        const orders = await query(sql);
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { order_status } = req.body;

        const STATUS_RANKS = {
            'Pending': 1,
            'Processing': 2,
            'Shipped': 3,
            'Delivered': 4,
            'Cancelled': 5
        };

        if (!STATUS_RANKS[order_status]) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        // Fetch current status
        const [order] = await query('SELECT order_status FROM orders WHERE id = ?', [id]);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const currentStatus = order.order_status;
        const currentRank = STATUS_RANKS[currentStatus] || 0;
        const newRank = STATUS_RANKS[order_status];

        // Terminal states check
        if (currentStatus === 'Delivered' || currentStatus === 'Cancelled') {
            return res.status(400).json({ message: `Cannot change status of a ${currentStatus} order` });
        }

        // Backward transition check
        if (newRank <= currentRank && order_status !== currentStatus) {
            return res.status(400).json({ message: `Cannot move status back from ${currentStatus} to ${order_status}` });
        }

        await query('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, id]);
        res.json({ message: `Order status updated to ${order_status}` });
    } catch (error) {
        next(error);
    }
};

export const getOrderItems = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT od.*, p.name, p.image_url
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            WHERE od.order_id = ?
        `;
        const items = await query(sql, [id]);
        res.json(items);
    } catch (error) {
        next(error);
    }
};

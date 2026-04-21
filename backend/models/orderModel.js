import pool, { query } from '../config/db.js';

/**
 * Helper to parse weight strings (e.g., "500g", "1kg") to kilogram values.
 */
const parseWeightToKg = (weightStr) => {
    if (!weightStr) return 1; 
    
    const weight = weightStr.toLowerCase().trim();
    const valueMatch = weight.match(/[\d.]+/);
    if (!valueMatch) return 1;
    
    const value = parseFloat(valueMatch[0]);

    if (weight.includes('kg') || weight.includes('kilogram') || weight.includes('kilo')) {
        return value;
    } else if (weight.includes('g') || weight.includes('gram')) {
        return value / 1000;
    }
    
    return value; // Default to kg
};

/**
 * Creates a new order with its details and clears the user's cart in a single transaction.
 */
export const createOrder = async (orderData, cartItems) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Insert Order
        const orderSql = `
            INSERT INTO orders (
                user_id, order_number, full_name, email, phone, 
                address_line1, address_line2, city, state, pincode, landmark,
                total_amount, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const orderValues = [
            orderData.user_id,
            orderData.order_number,
            orderData.full_name,
            orderData.email,
            orderData.phone,
            orderData.address_line1,
            orderData.address_line2,
            orderData.city,
            orderData.state,
            orderData.pincode,
            orderData.landmark,
            orderData.total_amount,
            orderData.payment_status || 'Paid'
        ];

        const [orderResult] = await connection.query(orderSql, orderValues);
        const orderId = orderResult.insertId;

        // 2. Insert Order Details
        const detailsSql = `
            INSERT INTO order_details (
                order_id, product_id, quantity, unit_price, subtotal
            ) VALUES ?
        `;
        const detailsValues = cartItems.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            item.price,
            item.subtotal
        ]);

        await connection.query(detailsSql, [detailsValues]);

        // 3. Update Inventory (Decrement available_stock based on weight and quantity)
        const inventorySql = `
            UPDATE inventory 
            SET available_stock = available_stock - ? 
            WHERE product_id = ? AND available_stock >= ?
        `;
        
        for (const item of cartItems) {
            const unitWeightKg = parseWeightToKg(item.weight);
            const totalDeduction = unitWeightKg * item.quantity;

            const [updateResult] = await connection.query(inventorySql, [totalDeduction, item.product_id, totalDeduction]);
            
            if (updateResult.affectedRows === 0) {
                // Determine if it was bad ID or insufficient stock
                const [check] = await connection.query('SELECT available_stock FROM inventory WHERE product_id = ?', [item.product_id]);
                const available = check.length > 0 ? check[0].available_stock : 0;
                
                throw new Error(
                    `Insufficient stock for "${item.name}". Required: ${totalDeduction}kg, Available: ${available}kg`
                );
            }
        }

        // 4. Clear User Cart
        // First find cart_id
        const [carts] = await connection.query('SELECT id FROM carts WHERE user_id = ?', [orderData.user_id]);
        if (carts.length > 0) {
            const cartId = carts[0].id;
            await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
        }

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Fetches order details by ID for success/confirmation page.
 */
export const getOrderById = async (orderId, userId) => {
    const orderSql = 'SELECT * FROM orders WHERE id = ? AND user_id = ?';
    const orders = await query(orderSql, [orderId, userId]);
    
    if (orders.length === 0) return null;

    const detailsSql = `
        SELECT od.*, p.name, p.image_url 
        FROM order_details od
        JOIN products p ON od.product_id = p.id
        WHERE od.order_id = ?
    `;
    const items = await query(detailsSql, [orderId]);

    return { ...orders[0], items };
};

/**
 * Creates a record in the payments table.
 */
export const createPaymentRecord = async (paymentData) => {
    const sql = `
        INSERT INTO payments (
            order_id, razorpay_order_id, razorpay_payment_id, payment_status, amount
        ) VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
        paymentData.order_id,
        paymentData.razorpay_order_id,
        paymentData.razorpay_payment_id,
        paymentData.payment_status || 'Paid',
        paymentData.amount
    ];
    return await query(sql, values);
};

/**
 * Fetches all orders for a specific user, including product items for each order.
 */
export const getUserOrders = async (userId) => {
    // 1. Fetch Orders
    const orderSql = `
        SELECT * FROM orders 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    `;
    const orders = await query(orderSql, [userId]);

    if (orders.length === 0) return [];

    // 2. Fetch all items for these orders in one query to avoid N+1
    const orderIds = orders.map(o => o.id);
    const detailsSql = `
        SELECT od.*, p.name, p.image_url,
               r.id as review_id,
               r.rating as review_rating,
               r.review_text as review_text
        FROM order_details od
        JOIN products p ON od.product_id = p.id
        LEFT JOIN reviews r ON r.product_id = od.product_id AND r.user_id = ?
        WHERE od.order_id IN (${orderIds.join(',')})
    `;
    const allItems = await query(detailsSql, [userId]);

    // 3. Group items by order_id
    const ordersWithItems = orders.map(order => ({
        ...order,
        items: allItems.filter(item => item.order_id === order.id)
    }));

    return ordersWithItems;
};

/**
 * Cancels a pending order and restores inventory stock in a transaction.
 */
export const cancelOrder = async (orderId, userId) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Verify order belongs to user and is Pending
        const [orders] = await connection.query(
            'SELECT order_status FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            throw new Error('Order not found or access denied.');
        }

        const currentStatus = orders[0].order_status;
        if (currentStatus !== 'Pending') {
            throw new Error(`Order cannot be cancelled. Current status: ${currentStatus}`);
        }

        // 2. Update status to Cancelled
        await connection.query(
            'UPDATE orders SET order_status = ? WHERE id = ?',
            ['Cancelled', orderId]
        );

        // 3. Restore Inventory
        // Fetch order details with product weight from products table
        const [items] = await connection.query(`
            SELECT od.product_id, od.quantity, p.weight
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            WHERE od.order_id = ?
        `, [orderId]);

        for (const item of items) {
            const unitWeightKg = parseWeightToKg(item.weight);
            const totalRestoration = unitWeightKg * item.quantity;

            await connection.query(
                'UPDATE inventory SET available_stock = available_stock + ? WHERE product_id = ?',
                [totalRestoration, item.product_id]
            );
        }

        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

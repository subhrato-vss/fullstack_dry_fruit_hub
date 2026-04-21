import { query } from '../config/db.js';

/**
 * Fetch high-level statistics for the Admin Dashboard Home.
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        // 1. Total Orders
        const ordersCountResult = await query('SELECT COUNT(*) as total_orders FROM orders');
        const totalOrders = ordersCountResult[0].total_orders;

        // 2. Revenue (Calculated from paid orders)
        // Adjusting logic based on common table structures, assuming 'paid' or 'success'
        const revenueResult = await query(`
            SELECT SUM(total_amount) as total_revenue 
            FROM orders 
            WHERE payment_status IN ('paid', 'completed', 'success')
        `);
        const totalRevenue = revenueResult[0].total_revenue || 0;

        // 3. Best Selling Products (by quantity sold)
        const bestSellers = await query(`
            SELECT p.id, p.name, p.image_url, SUM(od.quantity) as units_sold
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            GROUP BY p.id
            ORDER BY units_sold DESC
            LIMIT 5
        `);

        // 4. Low Stock Alerts (threshold < 10)
        const lowStockItems = await query(`
            SELECT p.id, p.name, i.available_stock
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            WHERE i.available_stock < 10
            ORDER BY i.available_stock ASC
        `);

        // 5. Total Products and Categories
        const productCountResult = await query('SELECT COUNT(*) as total_products FROM products');
        const categoryCountResult = await query('SELECT COUNT(*) as total_categories FROM categories');

        res.json({
            stats: {
                totalOrders,
                totalRevenue: parseFloat(totalRevenue).toFixed(2),
                lowStockCount: lowStockItems.length,
                totalProducts: productCountResult[0].total_products,
                totalCategories: categoryCountResult[0].total_categories
            },
            bestSellers,
            lowStockItems
        });
    } catch (error) {
        next(error);
    }
};

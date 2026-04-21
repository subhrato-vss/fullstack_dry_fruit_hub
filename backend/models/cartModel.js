import { query } from '../config/db.js';

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
 * Ensures a user has an active cart and returns its cart_id.
 */
export const getOrCreateCart = async (userId) => {
    const existing = await query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (existing.length > 0) return existing[0].id;

    const result = await query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    return result.insertId;
};

/**
 * Fetch all items in a user's cart with product details and calculated subtotals.
 */
export const getCartDetails = async (userId) => {
    const sql = `
        SELECT 
            ci.id as item_id,
            p.id as product_id,
            p.name,
            p.price,
            p.weight,
            p.image_url,
            ci.quantity,
            (p.price * ci.quantity) as subtotal
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = ?
    `;
    const items = await query(sql, [userId]);
    
    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    
    return { items, total };
};

/**
 * Logic to add a product to the cart. 
 * Increments quantity if the product is already present.
 */
export const addItem = async (userId, productId, quantity = 1) => {
    const cartId = await getOrCreateCart(userId);

    // Check if item exists in this cart
    const existing = await query(
        'SELECT id FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [cartId, productId]
    );

    if (existing.length > 0) {
        // Return null to indicate duplicate
        return null;
    } else {
        // Insert new item
        const result = await query(
            'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
            [cartId, productId, quantity]
        );
        return result.insertId;
    }
};

export const updateItemQty = async (itemId, quantity) => {
    return await query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
};

export const removeItem = async (itemId) => {
    return await query('DELETE FROM cart_items WHERE id = ?', [itemId]);
};

export const checkStockForCartItem = async (itemId, newQuantity) => {
    const sql = `
        SELECT p.name, p.weight, i.available_stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN inventory i ON p.id = i.product_id
        WHERE ci.id = ?
    `;
    const results = await query(sql, [itemId]);
    
    if (results.length === 0) return { isAvailable: false, message: 'Item not found.' };

    const { name, weight, available_stock } = results[0];
    const unitWeightKg = parseWeightToKg(weight);
    const requiredTotalWeightKg = unitWeightKg * newQuantity;

    if (requiredTotalWeightKg > available_stock) {
        return {
            isAvailable: false,
            message: `Additional quantity for "${name}" is not available in stock.`,
            availableStockKg: available_stock,
            requiredWeightKg: requiredTotalWeightKg
        };
    }

    return { isAvailable: true };
};

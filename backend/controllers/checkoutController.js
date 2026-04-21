import * as CartModel from '../models/cartModel.js';
import * as UserAuthModel from '../models/userAuthModel.js';

/**
 * Fetches user profile for prefilling and cart totals for summary.
 */
export const getCheckoutSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // 1. Fetch User Data for prefill
        const user = await UserAuthModel.findUserById(userId);
        
        // 2. Fetch Cart Details for summary
        const cartData = await CartModel.getCartDetails(userId);
        
        if (cartData.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        // 3. Dynamic Totals (Same logic as Cart.jsx)
        const subtotal = parseFloat(cartData.total);
        const shippingCharge = subtotal >= 1000 ? 0 : 50;
        const taxAmount = subtotal * 0.18;
        const finalTotal = subtotal + shippingCharge + taxAmount;

        res.json({
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone || ''
            },
            summary: {
                items: cartData.items,
                subtotal: subtotal.toFixed(2),
                shipping: shippingCharge.toFixed(2),
                tax: taxAmount.toFixed(2),
                total: finalTotal.toFixed(2)
            }
        });
    } catch (error) {
        next(error);
    }
};

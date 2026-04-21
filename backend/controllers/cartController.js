import * as CartModel from '../models/cartModel.js';

export const getCart = async (req, res, next) => {
    try {
        const cartData = await CartModel.getCartDetails(req.user.id);
        res.json(cartData);
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }
        const result = await CartModel.addItem(req.user.id, productId, quantity || 1);
        
        if (!result) {
            return res.status(400).json({ message: 'Product is already in your cart!' });
        }

        res.status(201).json({ message: 'Product added to cart!' });
    } catch (error) {
        next(error);
    }
};

export const updateQuantity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (quantity < 1) {
            await CartModel.removeItem(id);
            return res.json({ message: 'Item removed from cart.' });
        }

        // Stock Validation
        const stockCheck = await CartModel.checkStockForCartItem(id, quantity);
        if (!stockCheck.isAvailable) {
            return res.status(400).json({ message: stockCheck.message });
        }

        await CartModel.updateItemQty(id, quantity);
        res.json({ message: 'Quantity updated.' });
    } catch (error) {
        next(error);
    }
};

export const removeFromCart = async (req, res, next) => {
    try {
        const { id } = req.params;
        await CartModel.removeItem(id);
        res.json({ message: 'Item removed from cart.' });
    } catch (error) {
        next(error);
    }
};

import * as OrderModel from '../models/orderModel.js';

export const getOrderDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await OrderModel.getOrderById(id, req.user.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const orders = await OrderModel.getUserOrders(req.user.id);
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        await OrderModel.cancelOrder(id, req.user.id);
        res.json({ message: 'Order cancelled successfully and stock restored.' });
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('cannot be cancelled')) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

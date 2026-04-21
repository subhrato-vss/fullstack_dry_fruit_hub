import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import * as CartModel from '../models/cartModel.js';
import * as OrderModel from '../models/orderModel.js';

dotenv.config({ override: true });

/**
 * Initialize Razorpay ONLY if keys are present.
 */
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

/**
 * Create a Razorpay Order for Phase 9 (Test Mode).
 */
export const createRazorpayOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cartData = await CartModel.getCartDetails(userId);
        
        if (cartData.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate final total (Same as checkout/summary logic)
        const subtotal = parseFloat(cartData.total);
        const shippingCharge = subtotal >= 1000 ? 0 : 50;
        const taxAmount = subtotal * 0.18;
        const finalTotal = subtotal + shippingCharge + taxAmount;

        const options = {
            amount: Math.round(finalTotal * 100), // convert to paise
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
            id: `ord_mock_${Date.now()}`, // Bypassing Razorpay Orders API as requested
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key'
        };

        res.json({
            ...options,
            isMock: true
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Finalize Order after Test Payment Success.
 * No real signature verification as requested for demo.
 */
export const handleTestSuccess = async (req, res, next) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            billingDetails 
        } = req.body;

        // 1. Signature Verification Pattern (Alignment with skills folder)
        if (razorpay && razorpay_signature) {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: 'Payment verification failed: Invalid signature.' });
            }
        } else {
            console.log('⚠️ Bypassing signature verification (Mock Mode or missing signature)');
        }

        const userId = req.user.id;
        const { items, total: cartTotal } = await CartModel.getCartDetails(userId);
        
        // 1. Calculate final financial snapshot
        const subtotal = parseFloat(cartTotal);
        const shippingCharge = subtotal >= 1000 ? 0 : 50;
        const taxAmount = subtotal * 0.18;
        const finalTotal = subtotal + shippingCharge + taxAmount;

        const orderNumber = `RYZ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const orderData = {
            user_id: userId,
            order_number: orderNumber,
            full_name: billingDetails.full_name,
            email: billingDetails.email,
            phone: billingDetails.phone,
            address_line1: billingDetails.address_line1,
            address_line2: billingDetails.address_line2 ?? null,
            city: billingDetails.city,
            state: billingDetails.state,
            pincode: billingDetails.pincode,
            landmark: billingDetails.landmark ?? null,
            total_amount: finalTotal,
            payment_status: 'Paid'
        };

        // 2. Create Order & Order Details (Clears cart automatically in model)
        const orderId = await OrderModel.createOrder(orderData, items);

        // 3. Save Payment Record
        await OrderModel.createPaymentRecord({
            order_id: orderId,
            razorpay_order_id: razorpay_order_id ?? 'mock_order_no_id',
            razorpay_payment_id: razorpay_payment_id ?? 'mock_payment_id',
            payment_status: 'Paid',
            amount: finalTotal
        });

        res.status(201).json({ 
            message: 'Order placed successfully!', 
            orderId,
            orderNumber 
        });
    } catch (error) {
        next(error);
    }
};

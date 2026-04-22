import * as AIService from '../services/aiService.js';
import { query } from '../config/db.js';

export const askProductAI = async (req, res, next) => {
    try {
        const { productId, question } = req.body;

        if (!productId || !question) {
            return res.status(400).json({ message: 'Product ID and question are required.' });
        }

        // 1. Fetch Product with Category Context
        const sql = `
            SELECT p.*, c.name as category_name 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        const products = await query(sql, [productId]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const product = products[0];

        // 2. Get contextual AI response
        const response = await AIService.getProductAIResponse(product, question);

        res.json({
            productId,
            productName: product.name,
            answer: response
        });
    } catch (error) {
        next(error);
    }
};

export const askGeneralAI = async (req, res, next) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'A question is required.' });
        }

        // Fetch products for context
        const sql = `
            SELECT p.id, p.name, p.price, p.health_benefits, p.description, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
        `;
        const products = await query(sql);

        const response = await AIService.getGeneralAIResponse(question, products);

        res.json({
            answer: response
        });
    } catch (error) {
        next(error);
    }
};

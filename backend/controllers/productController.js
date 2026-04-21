import * as ProductModel from '../models/productModel.js';

export const getProducts = async (req, res, next) => {
    try {
        const { category, search, sort } = req.query;
        const products = await ProductModel.getAllProducts(category, search, sort);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

export const getProductDetail = async (req, res, next) => {
    try {
        const product = await ProductModel.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const getRelatedProducts = async (req, res, next) => {
    try {
        const product = await ProductModel.getProductById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const related = await ProductModel.getRelatedProducts(req.params.id, product.category_id);
        res.json(related);
    } catch (error) {
        next(error);
    }
};

export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await ProductModel.getCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

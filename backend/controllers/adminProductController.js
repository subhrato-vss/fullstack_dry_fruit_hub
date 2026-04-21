import * as AdminModel from '../models/adminProductModel.js';
import * as ProductModel from '../models/productModel.js';

export const getAdminProducts = async (req, res, next) => {
    try {
        const products = await ProductModel.getAllProducts();
        res.json(products);
    } catch (error) {
        next(error);
    }
};

export const addProduct = async (req, res, next) => {
    try {
        const productData = { ...req.body };
        
        // Handle main image
        if (req.files && req.files['image']) {
            productData.image_url = `/uploads/products/${req.files['image'][0].filename}`;
        }

        // Handle additional images
        if (req.files && req.files['additional_images']) {
            productData.additional_images = req.files['additional_images'].map(file => `/uploads/products/${file.filename}`);
        } else {
            productData.additional_images = [];
        }

        const productId = await AdminModel.createProduct(productData);
        res.status(201).json({ message: 'Product created successfully', id: productId });
    } catch (error) {
        next(error);
    }
};

export const editProduct = async (req, res, next) => {
    try {
        const productData = { ...req.body };
        
        // Handle main image
        if (req.files && req.files['image']) {
            productData.image_url = `/uploads/products/${req.files['image'][0].filename}`;
        }

        // Handle additional images
        if (req.files && req.files['additional_images']) {
            productData.additional_images = req.files['additional_images'].map(file => `/uploads/products/${file.filename}`);
        } else {
            // In edit mode, if no new additional images are uploaded, 
            // the existing additional_images URLs (sent as strings from frontend) 
            // should be preserved to avoid clearing them.
            // Map strings to handle any legacy or same-state URLs
            if (productData.additional_images && !Array.isArray(productData.additional_images)) {
                productData.additional_images = [productData.additional_images];
            }
        }

        await AdminModel.updateProduct(req.params.id, productData);
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const removeProduct = async (req, res, next) => {
    try {
        await AdminModel.deleteProduct(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

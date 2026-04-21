import { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    countProductsInCategory 
} from '../models/categoryModel.js';

export const getAdminCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};

export const createAdminCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        let image_url = null;

        if (req.file) {
            image_url = `/uploads/categories/${req.file.filename}`;
        }

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const insertId = await createCategory({ name, description, image_url });
        const newCategory = await getCategoryById(insertId);
        
        res.status(201).json({ message: 'Category created successfully', category: newCategory });
    } catch (error) {
        console.error('Error creating category:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'A category with this name already exists' });
        }
        res.status(500).json({ message: 'Failed to create category' });
    }
};

export const updateAdminCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description } = req.body;
        
        const existingCategory = await getCategoryById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        let image_url = existingCategory.image_url; // Default to existing
        if (req.file) {
            image_url = `/uploads/categories/${req.file.filename}`;
        }

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        await updateCategory(categoryId, { name, description, image_url });
        const updatedCategory = await getCategoryById(categoryId);

        res.json({ message: 'Category updated successfully', category: updatedCategory });
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'A category with this name already exists' });
        }
        res.status(500).json({ message: 'Failed to update category' });
    }
};

export const deleteAdminCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const existingCategory = await getCategoryById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Feature Rule: Do not delete if products are attached.
        const productCount = await countProductsInCategory(categoryId);
        if (productCount > 0) {
            return res.status(400).json({ 
                message: `Cannot delete category: Please re-assign or delete the ${productCount} existing product(s) first.` 
            });
        }

        await deleteCategory(categoryId);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Failed to delete category' });
    }
};

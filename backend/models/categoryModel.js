import db from '../config/db.js';

export const getAllCategories = async () => {
    const [rows] = await db.query(`
        SELECT c.*, COUNT(p.id) as product_count 
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.id DESC
    `);
    return rows;
};

export const getCategoryById = async (id) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
};

export const createCategory = async (categoryData) => {
    const { name, description, image_url } = categoryData;
    const [result] = await db.query(
        'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
        [name, description || null, image_url || null]
    );
    return result.insertId;
};

export const updateCategory = async (id, categoryData) => {
    const { name, description, image_url } = categoryData;
    const [result] = await db.query(
        'UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?',
        [name, description || null, image_url || null, id]
    );
    return result.affectedRows;
};

export const deleteCategory = async (id) => {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows;
};

export const countProductsInCategory = async (categoryId) => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [categoryId]);
    return rows[0].count;
};

import { query } from '../config/db.js';

export const findAdminByEmail = async (email) => {
    const results = await query('SELECT * FROM admins WHERE email = ?', [email]);
    return results[0];
};

export const findAdminById = async (id) => {
    const results = await query('SELECT id, name, email, created_at FROM admins WHERE id = ?', [id]);
    return results[0];
};

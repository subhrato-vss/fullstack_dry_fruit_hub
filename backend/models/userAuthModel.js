import { query } from '../config/db.js';

export const findUserByEmail = async (email) => {
    const results = await query('SELECT * FROM users WHERE email = ?', [email]);
    return results[0];
};

export const findUserById = async (id) => {
    const results = await query('SELECT id, name, email, phone, profile_image, created_at FROM users WHERE id = ?', [id]);
    return results[0];
};

export const createUser = async (userData) => {
    const { name, email, password, phone } = userData;
    const result = await query(
        'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
        [name, email, password, phone]
    );
    return result.insertId;
};

export const updateUser = async (id, userData) => {
    const { name, phone, profile_image } = userData;
    let sql = 'UPDATE users SET name = ?, phone = ?';
    let params = [name, phone];

    if (profile_image !== undefined) {
        sql += ', profile_image = ?';
        params.push(profile_image);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await query(sql, params);
};

export const updatePassword = async (id, hashedPassword) => {
    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
};

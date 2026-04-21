import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const createAdmin = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'dryfruit_hub_db'
        });

        const hashedPassword = await bcrypt.hash('123456', 10);
        
        await connection.query(
            'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
            ['System Admin', 'admin@gmail.com', hashedPassword]
        );

        console.log('✅ Admin user created successfully!');
        
        // Print the created admin to verify
        const [rows] = await connection.query('SELECT id, name, email FROM admins WHERE email = ?', ['admin@gmail.com']);
        console.log("Admin record:", rows[0]);

        await connection.end();
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
             console.log('⚠️ Admin with this email already exists.');
        } else {
             console.error('❌ Failed to create admin:', error.message);
        }
    }
};

createAdmin();

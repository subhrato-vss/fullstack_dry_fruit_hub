import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

async function testLoginLogic() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'system',
        database: process.env.DB_NAME || 'dryfruit_hub_db',
    });

    try {
        const inputEmail = 'subhratosingh@gmail.com';
        const inputPassword = 'password123'; // Guessing

        console.log(`Testing login for: ${inputEmail}`);
        const normalizedEmail = inputEmail.trim().toLowerCase();
        
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
        const user = rows[0];

        if (!user) {
            console.log('❌ User not found in DB');
        } else {
            console.log('✅ User found in DB');
            console.log('DB Password Hash:', user.password);
            
            const isMatch = await bcrypt.compare(inputPassword, user.password);
            console.log(`Password match with "${inputPassword}": ${isMatch}`);
            
            // Try another one common in these projects
            const isMatch2 = await bcrypt.compare('subhrato', user.password);
            console.log(`Password match with "subhrato": ${isMatch2}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

testLoginLogic();

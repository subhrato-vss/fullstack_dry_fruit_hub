import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const runMigration = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'system',
        database: process.env.DB_NAME || 'dryfruit_hub_db',
        multipleStatements: true
    });

    try {
        const migPath = path.join(__dirname, 'migration_v10.sql');
        const migSql = fs.readFileSync(migPath, 'utf8');
        
        console.log('📦 Running migration_v10.sql...');
        await connection.query(migSql);
        console.log('✅ Migration successful!');
    } catch (err) {
        if (err.errno === 1060) {
            console.log('⏭️  Column profile_image already exists.');
        } else {
            console.error('❌ Migration failed:', err.message);
        }
    } finally {
        await connection.end();
        process.exit();
    }
};

runMigration();

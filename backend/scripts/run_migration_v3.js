import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    console.log('✅ Connected for Phase 3 Migration.');

    try {
        const migrationPath = path.join(__dirname, 'migration_v3.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await connection.query(sql);

        console.log('🚀 Phase 3 Migration Successful!');
    } catch (error) {
        console.error('❌ Migration Error:', error);
    } finally {
        await connection.end();
    }
};

migrate();

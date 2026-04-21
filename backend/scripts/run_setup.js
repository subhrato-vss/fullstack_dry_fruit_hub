import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const setupDatabase = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    });

    console.log('✅ Connected to MySQL server.');

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split schema by semicolon to execute queries one by one
        // Note: This is a simple split, better to use a library for complex SQL
        const queries = schema
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (const query of queries) {
            await connection.query(query);
        }

        console.log('🚀 Database and tables created successfully!');
        console.log('🌱 Seed data inserted.');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    } finally {
        await connection.end();
    }
};

setupDatabase();

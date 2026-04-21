import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, 'migration_v8.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon, but handle cases where semicolon might be inside a string/comment
        // For simplicity here, we split by semicolon and filter out empty strings
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log('🚀 Starting Migration Phase 8...');

        for (const statement of statements) {
            await pool.query(statement);
            console.log('✅ Executed statement successfully.');
        }

        console.log('🎉 Phase 8 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
};

runMigration();

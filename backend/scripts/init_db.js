import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
    // Connect WITHOUT specifying a database first (to create it if needed)
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
        multipleStatements: true
    });

    const dbName = process.env.DB_NAME || 'dryfruit_hub_db';
    console.log(`🔌 Connected to MySQL. Target database: ${dbName}`);

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📦 Running schema.sql...');
    await connection.query(schemaSql);
    console.log('✅ schema.sql executed successfully.');

    // Check for migration files and run them in order
    const migrations = ['migration_v7.sql', 'migration_v8.sql'];
    for (const migFile of migrations) {
        const migPath = path.join(__dirname, migFile);
        if (fs.existsSync(migPath)) {
            console.log(`📦 Running ${migFile}...`);
            const migSql = fs.readFileSync(migPath, 'utf8');
            // Split by semicolons and run individually to handle errors gracefully
            const statements = migSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
            for (const stmt of statements) {
                try {
                    await connection.query(stmt);
                } catch (err) {
                    // Ignore "already exists" or "duplicate column" errors
                    if (err.errno === 1060 || err.errno === 1061 || err.errno === 1050) {
                        console.log(`  ⏭️  Skipped (already exists): ${err.sqlMessage}`);
                    } else {
                        console.error(`  ❌ Error in ${migFile}: ${err.sqlMessage}`);
                    }
                }
            }
            console.log(`✅ ${migFile} processed.`);
        }
    }

    // Create admins table if it doesn't exist
    await connection.query(`USE ${dbName}`);
    await connection.query(`
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ admins table ready.');

    await connection.end();
    console.log('🎉 Database initialization complete!');
    process.exit(0);
};

run().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
});

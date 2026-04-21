import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'dryfruit_hub_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log(`🔌 Database connected: ${process.env.DB_NAME || 'dryfruit_hub_db'}`);

/**
 * Execute a SQL query with parameters.
 * @param {string} sql - The SQL query string.
 * @param {Array} params - The parameters for the query.
 * @returns {Promise<any>} - The query results.
 */
export const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
};

export default pool;

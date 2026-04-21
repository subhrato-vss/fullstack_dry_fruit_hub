import { query } from '../config/db.js';

async function test() {
    try {
        const users = await query('SELECT * FROM users', []);
        console.log('Users in DB:');
        console.log(JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit();
}

test();

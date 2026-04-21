import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
    const testUser = {
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        password: 'password123',
        phone: '9876543210'
    };

    try {
        console.log('--- Registering ---');
        const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('Registration Response:', regRes.data);

        console.log('\n--- Logging In ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('Login Response:', loginRes.data);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

testAuth();

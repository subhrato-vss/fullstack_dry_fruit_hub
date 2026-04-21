import bcrypt from 'bcrypt';

async function verify() {
    const hash = '$2b$10$ufUy3wcI.dTUT0vvyhF6RusOqAARg7m7N8SFZLe04kpoMOIlIJl/G';
    const passwords = ['password', 'password123', 'subhrato', 'system', 'Admin@123'];
    
    for (const pw of passwords) {
        const match = await bcrypt.compare(pw, hash);
        console.log(`Password "${pw}" matches: ${match}`);
    }
}

verify();

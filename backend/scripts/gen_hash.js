import bcrypt from 'bcrypt';

const generateHash = async () => {
    const hash = await bcrypt.hash('Admin@123', 10);
    console.log('HASH:', hash);
};

generateHash();

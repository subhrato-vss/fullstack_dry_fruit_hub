import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as UserModel from '../models/userAuthModel.js';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

export const register = async (req, res, next) => {
    try {
        const { name, password, phone } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await UserModel.createUser({ name, email, password: hashedPassword, phone });

        res.status(201).json({ message: 'Registration successful!', userId });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        console.log('Login attempt for email:', email);

        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            console.log('Login failed: User not found for email:', email);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        console.log('User found:', user.email);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch for email:', email);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('user_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            message: 'Login successful!',
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                phone: user.phone, 
                profile_image: user.profile_image 
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;
        let profile_image = req.file ? `/uploads/profile_images/${req.file.filename}` : undefined;

        console.log(`Updating profile for user ${userId}:`, { name, phone, profile_image });

        await UserModel.updateUser(userId, { name, phone, profile_image });
        
        const updatedUser = await UserModel.findUserById(userId);
        res.json({
            message: 'Profile updated successfully!',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await UserModel.findUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.updatePassword(userId, hashedPassword);

        res.json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Change Password Error:', error);
        next(error);
    }
};

export const logout = (req, res) => {
    res.clearCookie('user_token');
    res.json({ message: 'Logged out successfully.' });
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await UserModel.findUserById(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const checkSession = async (req, res, next) => {
    try {
        const token = req.cookies.user_token;
        if (!token) return res.json(null);
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserModel.findUserById(decoded.id);
        res.json(user);
    } catch (error) {
        // Return null instead of 401 to prevent console network errors for guests
        res.json(null);
    }
};

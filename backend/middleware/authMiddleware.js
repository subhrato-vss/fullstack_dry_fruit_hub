import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

/**
 * Middleware to verify a Customer token.
 */
export const verifyUserToken = (req, res, next) => {
    const token = req.cookies.user_token;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Please login as a user.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contains id, email, name
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

/**
 * Middleware to verify an Administrator token.
 */
export const verifyAdminToken = (req, res, next) => {
    const token = req.cookies.admin_token;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Administrator login required.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Ensure it has the admin claim (we add this during signing)
        if (!decoded.isAdmin) {
             return res.status(403).json({ message: 'Forbidden. Admin access required.' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired admin token.' });
    }
};

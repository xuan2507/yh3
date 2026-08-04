const jwt = require('jsonwebtoken');
const { pool } = require('../db/config');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required');
    process.exit(1);
}

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = verifyToken(authHeader.slice(7));
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const result = await pool.query(
            'SELECT id, email, first_name, last_name, exam_type, plan FROM users WHERE id = $1',
            [decoded.userId]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = result.rows[0];
        req.userId = result.rows[0].id;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

// Simple auth for routes using req.userId
async function simpleAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const decoded = verifyToken(authHeader.slice(7));
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error('Simple auth error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

// Legacy compat: 'auth' is the simple version used by payments.js etc.
const auth = simpleAuth;

module.exports = { generateToken, verifyToken, authMiddleware, simpleAuth, auth };

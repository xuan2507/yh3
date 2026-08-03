const jwt = require('jsonwebtoken');
const { pool } = require('../db/config');

const JWT_SECRET = process.env.JWT_SECRET || 'learnai-dev-secret-change-in-production';

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
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(authHeader.slice(7));
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const result = await pool.query('SELECT id, email, first_name, last_name, exam_type, plan FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
}

module.exports = { generateToken, verifyToken, authMiddleware };

const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/config');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, examType } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, exam_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, exam_type, plan',
            [email, hash, firstName || '', lastName || '', examType || 'A-Level']
        );

        const user = result.rows[0];
        const token = generateToken(user.id);

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                examType: user.exam_type,
                plan: user.plan
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                examType: user.exam_type,
                plan: user.plan
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/me', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token' });
        }
        const { verifyToken } = require('../middleware/auth');
        const decoded = verifyToken(auth.slice(7));
        if (!decoded) return res.status(401).json({ error: 'Invalid token' });

        const result = await pool.query(
            'SELECT id, email, first_name, last_name, exam_type, plan FROM users WHERE id = $1',
            [decoded.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = result.rows[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            examType: user.exam_type,
            plan: user.plan
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

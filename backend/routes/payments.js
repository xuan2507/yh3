const express = require('express');
const router = express.Router();
const { pool } = require('../db/config');
const auth = require('../middleware/auth');

// Create payment request
router.post('/', auth, async (req, res) => {
    try {
        const { plan, amount, method, reference } = req.body;
        const result = await pool.query(
            `INSERT INTO payments (user_id, plan, amount, method, reference, status)
             VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
            [req.userId, plan || 'pro', amount, method, reference]
        );
        res.json({ success: true, payment: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get my payments
router.get('/my', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.userId]
        );
        res.json({ payments: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: list all pending payments
router.get('/admin/all', auth, async (req, res) => {
    try {
        // Simple admin check: first user or specific email
        const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
        const email = userRes.rows[0]?.email;
        if (email !== 'admin@learnai.com') {
            return res.status(403).json({ error: 'Admin only' });
        }
        const result = await pool.query(
            `SELECT p.*, u.email, u.first_name FROM payments p
             JOIN users u ON p.user_id = u.id
             ORDER BY p.created_at DESC`
        );
        res.json({ payments: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: verify payment and upgrade user
router.post('/admin/verify/:id', auth, async (req, res) => {
    try {
        const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
        const email = userRes.rows[0]?.email;
        if (email !== 'admin@learnai.com') {
            return res.status(403).json({ error: 'Admin only' });
        }
        const { id } = req.params;
        await pool.query(
            `UPDATE payments SET status = 'completed', verified_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );
        const payRes = await pool.query('SELECT user_id FROM payments WHERE id = $1', [id]);
        if (payRes.rows[0]) {
            await pool.query(
                `UPDATE users SET plan = 'pro' WHERE id = $1`,
                [payRes.rows[0].user_id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check if user is pro
router.get('/status', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT plan FROM users WHERE id = $1',
            [req.userId]
        );
        res.json({ pro: result.rows[0]?.plan === 'pro' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

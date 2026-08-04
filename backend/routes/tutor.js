const express = require('express');
const { pool } = require('../db/config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.post('/messages', async (req, res) => {
    try {
        const { role, content } = req.body;
        const result = await pool.query(
            'INSERT INTO tutor_messages (user_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, role, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.get('/messages', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tutor_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
            [req.user.id]
        );
        res.json(result.rows.reverse());
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

module.exports = router;

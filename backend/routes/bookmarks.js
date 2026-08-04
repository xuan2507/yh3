const express = require('express');
const { pool } = require('../db/config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const { itemId, itemType, data } = req.body;
        const result = await pool.query(
            'INSERT INTO bookmarks (user_id, item_id, item_type, data) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, itemId, itemType || 'resource', JSON.stringify(data || {})]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM bookmarks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

module.exports = router;

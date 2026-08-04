const express = require('express');
const { pool } = require('../db/config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const { subject, question, correctAnswer, userAnswer, explanation, topic } = req.body;
        const result = await pool.query(
            'INSERT INTO mistakes (user_id, subject, question, correct_answer, user_answer, explanation, topic) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [req.user.id, subject, question, correctAnswer, userAnswer, explanation, topic || 'General']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.get('/', async (req, res) => {
    try {
        const { subject, mastered } = req.query;
        let sql = 'SELECT * FROM mistakes WHERE user_id = $1';
        let params = [req.user.id];
        let idx = 2;
        if (subject) {
            sql += ` AND subject = $${idx++}`;
            params.push(subject);
        }
        if (mastered !== undefined) {
            sql += ` AND mastered = $${idx++}`;
            params.push(mastered === 'true');
        }
        sql += ' ORDER BY created_at DESC';
        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.patch('/:id/mastered', async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE mistakes SET mastered = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.patch('/:id/unmaster', async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE mistakes SET mastered = FALSE WHERE id = $1 AND user_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM mistakes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.get('/patterns', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT topic, COUNT(*) as count FROM mistakes WHERE user_id = $1 AND mastered = FALSE GROUP BY topic ORDER BY count DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

module.exports = router;

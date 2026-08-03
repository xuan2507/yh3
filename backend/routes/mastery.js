const express = require('express');
const { pool } = require('../db/config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.post('/', async (req, res) => {
    try {
        const { subject, topic, correct } = req.body;
        const existing = await pool.query(
            'SELECT * FROM topic_mastery WHERE user_id = $1 AND subject = $2 AND topic = $3',
            [req.user.id, subject, topic]
        );

        if (existing.rows.length === 0) {
            const score = correct ? 15 : 0;
            const result = await pool.query(
                'INSERT INTO topic_mastery (user_id, subject, topic, score, attempts, last_seen, correct_streak) VALUES ($1, $2, $3, $4, 1, NOW(), $5) RETURNING *',
                [req.user.id, subject, topic, score, correct ? 1 : 0]
            );
            return res.status(201).json(result.rows[0]);
        }

        const m = existing.rows[0];
        let newScore = m.score;
        let streak = correct ? m.correct_streak + 1 : 0;
        if (correct) newScore = Math.min(100, m.score + 15);
        else newScore = Math.max(0, m.score - 10);

        const result = await pool.query(
            'UPDATE topic_mastery SET score = $1, attempts = $2, last_seen = NOW(), correct_streak = $3 WHERE id = $4 RETURNING *',
            [newScore, m.attempts + 1, streak, m.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:subject', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM topic_mastery WHERE user_id = $1 AND subject = $2',
            [req.user.id, req.params.subject]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM topic_mastery WHERE user_id = $1',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/weak/:subject', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM topic_mastery WHERE user_id = $1 AND subject = $2 AND score < 50 AND attempts >= 2 ORDER BY score ASC',
            [req.user.id, req.params.subject]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

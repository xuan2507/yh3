const express = require('express');
const { pool } = require('../db/config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.post('/results', async (req, res) => {
    try {
        const { subject, score, total, topic } = req.body;
        const result = await pool.query(
            'INSERT INTO quiz_results (user_id, subject, score, total, topic) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, subject, score, total, topic || 'General']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.get('/results', async (req, res) => {
    try {
        const { subject } = req.query;
        let sql = 'SELECT * FROM quiz_results WHERE user_id = $1';
        let params = [req.user.id];
        if (subject) {
            sql += ' AND subject = $2';
            params.push(subject);
        }
        sql += ' ORDER BY created_at DESC';
        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const results = await pool.query(
            'SELECT subject, COUNT(*) as quizzes_taken, AVG(score::float / total * 100) as avg_score FROM quiz_results WHERE user_id = $1 GROUP BY subject',
            [req.user.id]
        );
        const total = await pool.query(
            'SELECT COUNT(*) as total_quizzes, AVG(score::float / total * 100) as overall_avg FROM quiz_results WHERE user_id = $1',
            [req.user.id]
        );
        res.json({
            bySubject: results.rows,
            overall: total.rows[0]
        });
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

module.exports = router;

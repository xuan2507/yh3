const express = require('express');
const { pool } = require('../db/config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const GRADE_MAP = { 'A*': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55, 'E': 45 };

router.post('/', async (req, res) => {
    try {
        const { subject, targetGrade, deadline } = req.body;
        const targetPct = GRADE_MAP[targetGrade] || 80;

        const avgResult = await pool.query(
            'SELECT AVG(score::float / total * 100) as avg FROM quiz_results WHERE user_id = $1 AND subject = $2',
            [req.user.id, subject]
        );
        const currentPct = Math.round(avgResult.rows[0]?.avg || 0);
        const currentGrade = scoreToGrade(currentPct);
        const gap = Math.max(0, targetPct - currentPct);
        const daysLeft = Math.max(1, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)));
        const dailyTarget = Math.round((gap / daysLeft) * 60 / 60 * 10) / 10;

        const result = await pool.query(
            'INSERT INTO goals (user_id, subject, target_grade, current_grade, deadline, daily_target_hours, gap, days_left) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [req.user.id, subject, targetGrade, currentGrade, deadline, dailyTarget, gap, daysLeft]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM goals WHERE user_id = $1 ORDER BY deadline ASC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/:id/progress', async (req, res) => {
    try {
        const { currentScore } = req.body;
        const goal = await pool.query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (goal.rows.length === 0) return res.status(404).json({ error: 'Not found' });

        const g = goal.rows[0];
        const currentGrade = scoreToGrade(currentScore);
        const completed = currentScore >= (GRADE_MAP[g.target_grade] || 80);

        const result = await pool.query(
            'UPDATE goals SET current_grade = $1, completed = $2 WHERE id = $3 RETURNING *',
            [currentGrade, completed, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM goals WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function scoreToGrade(score) {
    if (score >= 95) return 'A*';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 55) return 'D';
    if (score >= 45) return 'E';
    return 'U';
}

module.exports = router;

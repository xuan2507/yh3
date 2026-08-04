const express = require('express');
const { pool } = require('../db/config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.post('/time', async (req, res) => {
    try {
        const { subject, minutes } = req.body;
        const result = await pool.query(
            'INSERT INTO study_sessions (user_id, subject, minutes) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, subject || 'general', minutes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const total = await pool.query(
            'SELECT COALESCE(SUM(minutes), 0) as total_minutes, COUNT(*) as sessions FROM study_sessions WHERE user_id = $1',
            [req.user.id]
        );
        const bySubject = await pool.query(
            'SELECT subject, COALESCE(SUM(minutes), 0) as minutes FROM study_sessions WHERE user_id = $1 GROUP BY subject',
            [req.user.id]
        );
        const streak = await pool.query(
            `WITH dates AS (
                SELECT DISTINCT DATE(created_at) as d FROM study_sessions WHERE user_id = $1 ORDER BY d DESC
            )
            SELECT COUNT(*) as streak FROM dates d1
            WHERE NOT EXISTS (
                SELECT 1 FROM dates d2 WHERE d2.d = d1.d - INTERVAL '1 day'
            ) OR d1.d = (SELECT MAX(d) FROM dates)`
        );
        res.json({
            totalMinutes: parseInt(total.rows[0].total_minutes),
            totalHours: Math.round(parseInt(total.rows[0].total_minutes) / 60),
            sessions: parseInt(total.rows[0].sessions),
            bySubject: bySubject.rows,
            streak: parseInt(streak.rows[0]?.streak || 0)
        });
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

module.exports = router;

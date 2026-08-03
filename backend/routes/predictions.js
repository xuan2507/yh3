const express = require('express');
const { pool } = require('../db/config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/memory-decay', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT subject, topic, last_seen, attempts, score,
                EXTRACT(DAY FROM NOW() - last_seen) as days_since
             FROM topic_mastery
             WHERE user_id = $1 AND last_seen IS NOT NULL
             ORDER BY days_since DESC`,
            [req.user.id]
        );
        const alerts = result.rows.filter(r => {
            const decayDays = Math.max(1, 7 - Math.min(r.attempts || 0, 6));
            return r.days_since >= decayDays;
        }).map(r => ({
            subject: r.subject,
            topic: r.topic,
            daysSince: Math.floor(r.days_since),
            attempts: r.attempts,
            mastery: r.score,
            urgency: r.days_since >= (Math.max(1, 7 - Math.min(r.attempts || 0, 6)) * 2) ? 'high' : 'medium'
        }));
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/exam/:subject', async (req, res) => {
    try {
        const weak = await pool.query(
            'SELECT topic, score FROM topic_mastery WHERE user_id = $1 AND subject = $2 AND score < 60 AND attempts >= 2',
            [req.user.id, req.params.subject]
        );
        const mistakes = await pool.query(
            'SELECT topic FROM mistakes WHERE user_id = $1 AND subject = $2 AND mastered = FALSE',
            [req.user.id, req.params.subject]
        );

        const combined = {};
        weak.rows.forEach(w => {
            combined[w.topic] = { topic: w.topic, score: w.score, source: 'weak' };
        });
        mistakes.rows.forEach(m => {
            if (combined[m.topic]) {
                combined[m.topic].source = 'both';
                combined[m.topic].score = Math.min(combined[m.topic].score, 40);
            } else {
                combined[m.topic] = { topic: m.topic, score: 40, source: 'mistake' };
            }
        });

        res.json(Object.values(combined).sort((a, b) => a.score - b.score));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

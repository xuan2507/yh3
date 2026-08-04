const express = require('express');
const router = express.Router();
const { pool } = require('../db/config');
const auth = require('../middleware/auth');

// Create flashcard
router.post('/', auth, async (req, res) => {
    try {
        const { deck_name, front, back, subject } = req.body;
        const result = await pool.query(
            `INSERT INTO flashcards (user_id, deck_name, front, back, subject)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.userId, deck_name, front, back, subject || 'general']
        );
        res.json({ success: true, card: result.rows[0] });
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

// Get my flashcards
router.get('/', auth, async (req, res) => {
    try {
        const { deck } = req.query;
        let query = `SELECT * FROM flashcards WHERE user_id = $1`;
        let params = [req.userId];
        if (deck) {
            query += ` AND deck_name = $2`;
            params.push(deck);
        }
        query += ` ORDER BY created_at DESC`;
        const result = await pool.query(query, params);
        res.json({ cards: result.rows });
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

// Get deck names
router.get('/decks', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT deck_name, subject, COUNT(*) as count,
             SUM(CASE WHEN mastered THEN 1 ELSE 0 END) as mastered_count
             FROM flashcards WHERE user_id = $1
             GROUP BY deck_name, subject`,
            [req.userId]
        );
        res.json({ decks: result.rows });
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

// Update flashcard (mastered, review)
router.patch('/:id', auth, async (req, res) => {
    try {
        const { mastered, front, back } = req.body;
        const updates = [];
        const params = [];
        let idx = 1;
        if (mastered !== undefined) {
            updates.push(`mastered = $${idx++}`);
            params.push(mastered);
        }
        if (front !== undefined) {
            updates.push(`front = $${idx++}`);
            params.push(front);
        }
        if (back !== undefined) {
            updates.push(`back = $${idx++}`);
            params.push(back);
        }
        if (mastered !== undefined && mastered) {
            updates.push(`review_count = review_count + 1`);
            updates.push(`last_reviewed = CURRENT_TIMESTAMP`);
        }
        params.push(req.params.id, req.userId);
        const result = await pool.query(
            `UPDATE flashcards SET ${updates.join(', ')} WHERE id = $${idx} AND user_id = $${idx+1} RETURNING *`,
            params
        );
        res.json({ success: true, card: result.rows[0] });
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

// Delete flashcard
router.delete('/:id', auth, async (req, res) => {
    try {
        await pool.query(
            `DELETE FROM flashcards WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Error in " + __filename + ":", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

module.exports = router;

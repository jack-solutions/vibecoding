const express = require('express');
const router = express.Router();
const db = require('../db');

// Get comments for a video
router.get('/:videoId', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT c.*, u.username, u.avatar_url FROM comments c JOIN users u ON c.user_id = u.id WHERE video_id = ? ORDER BY c.created_at DESC',
            [req.params.videoId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Add a comment
router.post('/', async (req, res) => {
    const { text, video_id, user_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO comments (text, video_id, user_id) VALUES (?, ?, ?)',
            [text, video_id, user_id]
        );
        res.status(201).json({ id: result.insertId, message: 'Comment added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

module.exports = router;

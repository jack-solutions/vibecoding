const express = require('express');
const router = express.Router();
const db = require('../db');

// Subscribe
router.post('/', async (req, res) => {
    const { subscriber_id, channel_id } = req.body;
    try {
        await db.query('INSERT INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)', [subscriber_id, channel_id]);
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Already subscribed' });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// Unsubscribe
router.delete('/', async (req, res) => {
    const { subscriber_id, channel_id } = req.body;
    try {
        await db.query('DELETE FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?', [subscriber_id, channel_id]);
        res.json({ message: 'Unsubscribed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

// Check subscription status
router.get('/check', async (req, res) => {
    const { subscriber_id, channel_id } = req.query;
    try {
        const [rows] = await db.query('SELECT * FROM subscriptions WHERE subscriber_id = ? AND channel_id = ?', [subscriber_id, channel_id]);
        res.json({ subscribed: rows.length > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to check subscription' });
    }
});

// Get subscribed videos feed
router.get('/feed/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT v.*, u.username, u.avatar_url 
            FROM videos v
            JOIN users u ON v.user_id = u.id
            JOIN subscriptions s ON v.user_id = s.channel_id
            WHERE s.subscriber_id = ?
            ORDER BY v.created_at DESC
        `, [req.params.userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

module.exports = router;

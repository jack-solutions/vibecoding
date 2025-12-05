const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get all videos
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM videos ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Get video by ID
router.get('/:id', async (req, res) => {
    try {
        // Increment views
        await db.query('UPDATE videos SET views = views + 1 WHERE id = ?', [req.params.id]);

        const [rows] = await db.query('SELECT * FROM videos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

// Upload video
router.post('/', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    const { title, description, user_id } = req.body;
    const videoFiles = req.files['video'];
    const thumbnailFiles = req.files['thumbnail'];

    if (!videoFiles || !thumbnailFiles) {
        return res.status(400).json({ error: 'Video and Thumbnail files are required' });
    }

    const videoUrl = `http://localhost:5000/uploads/${videoFiles[0].filename}`;
    const thumbnailUrl = `http://localhost:5000/uploads/${thumbnailFiles[0].filename}`;

    try {
        const [result] = await db.query(
            'INSERT INTO videos (title, description, thumbnail_url, video_url, user_id) VALUES (?, ?, ?, ?, ?)',
            [title, description, thumbnailUrl, videoUrl, user_id || 1] // Mock user_id if not present
        );
        res.status(201).json({ id: result.insertId, message: 'Video uploaded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

module.exports = router;

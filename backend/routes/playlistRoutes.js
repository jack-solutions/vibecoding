const express = require('express');
const router = express.Router();
const { createPlaylist, getMyPlaylists } = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .post(protect, authorize('Creator'), createPlaylist);

router.route('/my')
    .get(protect, getMyPlaylists);

module.exports = router;

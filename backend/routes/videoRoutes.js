const express = require('express');
const router = express.Router();
const { uploadVideo, getVideos, getVideoById, likeVideo } = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const commentRouter = require('./commentRoutes');

router.use('/:videoId/comments', commentRouter);

router.route('/')
    .get(getVideos)
    .post(protect, authorize('Creator', 'Admin'), upload.single('video'), uploadVideo);

router.route('/:id')
    .get(getVideoById);

router.route('/:id/like')
    .put(protect, likeVideo);

module.exports = router;

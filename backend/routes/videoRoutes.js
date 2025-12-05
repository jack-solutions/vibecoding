const express = require('express');
const router = express.Router();
const {
  upload,
  uploadVideo,
  getAllVideos,
  getVideo,
  likeVideo,
  dislikeVideo,
  deleteVideo,
  updateVideo,
  getMyVideos,
  getTrendingVideos,
  getRecommendedVideos,
  searchVideos,
} = require('../controllers/videoController');
const protect = require('../middleware/auth');

// Public routes
router.get('/', getAllVideos);
router.get('/trending', getTrendingVideos);
router.get('/recommended', getRecommendedVideos);
router.get('/search', searchVideos);

// Protected routes - MUST come before /:id route
router.get('/my/videos', protect, getMyVideos);
router.post('/upload', protect, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), uploadVideo);

router.put('/:id', protect, updateVideo);
router.put('/:id/like', protect, likeVideo);
router.put('/:id/dislike', protect, dislikeVideo);
router.delete('/:id', protect, deleteVideo);

// This must be last - catches all other /:id routes
router.get('/:id', getVideo);

module.exports = router;

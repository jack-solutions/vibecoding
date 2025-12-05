const express = require('express');
const router = express.Router();
const {
  createOrUpdateChannel,
  getChannel,
  getChannelVideos,
  toggleSubscribe,
  getMyChannel,
} = require('../controllers/channelController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/:id', getChannel);
router.get('/:id/videos', getChannelVideos);

// Protected routes
router.post('/', auth, roleCheck('Creator'), createOrUpdateChannel);
router.get('/my/channel', auth, roleCheck('Creator'), getMyChannel);
router.put('/:id/subscribe', auth, toggleSubscribe);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createChannel, getChannelById, toggleSubscribe } = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createChannel);
router.route('/:id').get(getChannelById);
router.route('/:id/subscribe').put(protect, toggleSubscribe);

module.exports = router;

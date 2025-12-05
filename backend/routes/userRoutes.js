const express = require('express');
const router = express.Router();
const { subscribeToChannel, getSubscriptions } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/subscribe/:channelId', protect, subscribeToChannel);
router.get('/subscriptions', protect, getSubscriptions);

module.exports = router;

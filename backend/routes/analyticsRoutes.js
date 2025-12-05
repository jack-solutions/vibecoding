const express = require('express');
const router = express.Router();
const { getCreatorAnalytics } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('Creator'), getCreatorAnalytics);

module.exports = router;

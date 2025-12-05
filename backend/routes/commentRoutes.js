const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access videoId
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getComments)
    .post(protect, addComment);

module.exports = router;

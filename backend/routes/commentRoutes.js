const express = require('express');
const router = express.Router();
const {
  addComment,
  getVideoComments,
  deleteComment,
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/', auth, addComment);
router.get('/:videoId', getVideoComments);
router.delete('/:id', auth, deleteComment);

module.exports = router;

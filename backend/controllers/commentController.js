const Comment = require('../models/Comment');

// @desc    Add comment to video
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { videoId, text } = req.body;
    
    if (!text || !videoId) {
      return res.status(400).json({ message: 'Video ID and comment text are required' });
    }
    
    const comment = await Comment.create({
      video: videoId,
      user: req.user._id,
      text,
    });
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a video
// @route   GET /api/comments/:videoId
// @access  Public
const getVideoComments = async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.videoId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is comment owner or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await comment.deleteOne();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  getVideoComments,
  deleteComment,
};

const Comment = require('../models/Comment');
const Video = require('../models/Video');

// @desc    Add a comment to a video
// @route   POST /api/videos/:videoId/comments
// @access  Private
const addComment = async (req, res, next) => {
    try {
        const { content } = req.body;
        const video = await Video.findById(req.params.videoId);

        if (!video) {
            res.status(404);
            throw new Error('Video not found');
        }

        const comment = await Comment.create({
            userId: req.user._id, // Ensure Comment model uses userId
            videoId: req.params.videoId, // Ensure Comment model uses videoId
            content // Ensure Comment model uses content
        });

        const fullComment = await Comment.findById(comment._id).populate('userId', 'username avatar');

        res.status(201).json(fullComment);
    } catch (error) {
        next(error);
    }
};

// @desc    Get comments for a video
// @route   GET /api/videos/:videoId/comments
// @access  Public
const getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ videoId: req.params.videoId })
            .populate('userId', 'username avatar')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addComment,
    getComments
};

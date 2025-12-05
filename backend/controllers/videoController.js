const Video = require('../models/Video');
const User = require('../models/User');

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private (Creator only)
const uploadVideo = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No video file uploaded');
        }

        const { title, description, tags } = req.body;

        const video = await Video.create({
            title,
            description,
            videoUrl: `http://localhost:5000/uploads/${req.file.filename}`, // Assuming local serving
            creator: req.user._id,
            tags: tags ? tags.split(',') : []
        });

        res.status(201).json(video);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all videos (Public Feed)
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res, next) => {
    try {
        const keyword = req.query.keyword ? {
            title: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        } : {};

        const videos = await Video.find({ ...keyword }).populate('creator', 'username avatar');
        res.json(videos);
    } catch (error) {
        next(error);
    }
};

// @desc    Get video by ID
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id).populate('creator', 'username avatar subscribers');

        if (video) {
            // Increment views (simple implementation)
            video.views += 1;
            await video.save();
            res.json(video);
        } else {
            res.status(404);
            throw new Error('Video not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Like a video
// @route   PUT /api/videos/:id/like
// @access  Private
const likeVideo = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);

        if (video) {
            if (video.likes.includes(req.user._id)) {
                // Unlike
                video.likes = video.likes.filter(id => id.toString() !== req.user._id.toString());
            } else {
                // Like
                video.likes.push(req.user._id);
                // Remove dislike if exists
                video.dislikes = video.dislikes.filter(id => id.toString() !== req.user._id.toString());
            }
            await video.save();
            res.json(video);
        } else {
            res.status(404);
            throw new Error('Video not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadVideo,
    getVideos,
    getVideoById,
    likeVideo
};

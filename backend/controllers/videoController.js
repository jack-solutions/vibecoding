const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');
const Channel = require('../models/Channel');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    } else if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// @desc    Upload video
// @route   POST /api/videos/upload
// @access  Private/Creator
const uploadVideo = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Please upload a video file' });
    }
    
    // Get creator's channel
    const channel = await Channel.findOne({ creator: req.user._id });
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found. Please create a channel first.' });
    }
    
    const videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
    const thumbnailUrl = req.files.thumbnail 
      ? `/uploads/thumbnails/${req.files.thumbnail[0].filename}`
      : '';
    
    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      creator: req.user._id,
      channel: channel._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    });
    
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('creator', 'username')
      .populate('channel', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('creator', 'username')
      .populate('channel', 'name avatar subscribers');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Increment view count
    video.views += 1;
    await video.save();
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike video
// @route   PUT /api/videos/:id/like
// @access  Private
const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const userId = req.user._id;
    
    // Remove from dislikes if present
    video.dislikes = video.dislikes.filter(id => id.toString() !== userId.toString());
    
    // Toggle like
    const likeIndex = video.likes.findIndex(id => id.toString() === userId.toString());
    
    if (likeIndex > -1) {
      video.likes.splice(likeIndex, 1);
    } else {
      video.likes.push(userId);
    }
    
    await video.save();
    
    res.json({
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      userLiked: likeIndex === -1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dislike/Undislike video
// @route   PUT /api/videos/:id/dislike
// @access  Private
const dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    const userId = req.user._id;
    
    // Remove from likes if present
    video.likes = video.likes.filter(id => id.toString() !== userId.toString());
    
    // Toggle dislike
    const dislikeIndex = video.dislikes.findIndex(id => id.toString() === userId.toString());
    
    if (dislikeIndex > -1) {
      video.dislikes.splice(dislikeIndex, 1);
    } else {
      video.dislikes.push(userId);
    }
    
    await video.save();
    
    res.json({
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      userDisliked: dislikeIndex === -1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private/Creator/Admin
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if user is creator or admin
    if (video.creator.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }
    
    await video.deleteOne();
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending videos
// @route   GET /api/videos/trending
// @access  Public
const getTrendingVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('creator', 'username')
      .populate('channel', 'name avatar')
      .sort({ views: -1, createdAt: -1 })
      .limit(20);
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommended videos
// @route   GET /api/videos/recommended
// @access  Public
const getRecommendedVideos = async (req, res) => {
  try {
    const { tags } = req.query;
    
    let query = {};
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    const videos = await Video.find(query)
      .populate('creator', 'username')
      .populate('channel', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search videos
// @route   GET /api/videos/search
// @access  Public
const searchVideos = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const videos = await Video.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ]
    })
      .populate('creator', 'username')
      .populate('channel', 'name avatar')
      .sort({ views: -1 });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private/Creator
const updateVideo = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if user is the creator
    if (video.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }
    
    video.title = title || video.title;
    video.description = description || video.description;
    video.tags = tags ? tags.split(',').map(tag => tag.trim()) : video.tags;
    
    await video.save();
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get creator's videos
// @route   GET /api/videos/my-videos
// @access  Private/Creator
const getMyVideos = async (req, res) => {
  try {
    const videos = await Video.find({ creator: req.user._id })
      .populate('channel', 'name')
      .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};

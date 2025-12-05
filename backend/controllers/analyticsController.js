const Video = require('../models/Video');
const Channel = require('../models/Channel');

// @desc    Get creator analytics
// @route   GET /api/analytics
// @access  Private/Creator
const getCreatorAnalytics = async (req, res) => {
  try {
    // Get creator's channel
    const channel = await Channel.findOne({ creator: req.user._id });
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    // Get all videos by creator
    const videos = await Video.find({ creator: req.user._id });
    
    // Calculate analytics
    const totalUploads = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = videos.reduce((sum, video) => sum + video.likes.length, 0);
    const subscriberCount = channel.subscribers.length;
    
    res.json({
      totalUploads,
      totalViews,
      totalLikes,
      subscriberCount,
      recentVideos: videos.slice(0, 5).map(v => ({
        _id: v._id,
        title: v.title,
        views: v.views,
        likes: v.likes.length,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCreatorAnalytics,
};

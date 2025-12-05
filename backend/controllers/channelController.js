const Channel = require('../models/Channel');
const Video = require('../models/Video');

// @desc    Create or update channel
// @route   POST /api/channels
// @access  Private/Creator
const createOrUpdateChannel = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    
    let channel = await Channel.findOne({ creator: req.user._id });
    
    if (channel) {
      // Update existing channel
      channel.name = name || channel.name;
      channel.description = description || channel.description;
      channel.avatar = avatar || channel.avatar;
      await channel.save();
    } else {
      // Create new channel
      channel = await Channel.create({
        creator: req.user._id,
        name,
        description,
        avatar,
      });
    }
    
    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get channel by ID
// @route   GET /api/channels/:id
// @access  Public
const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('creator', 'username');
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get channel videos
// @route   GET /api/channels/:id/videos
// @access  Public
const getChannelVideos = async (req, res) => {
  try {
    const videos = await Video.find({ channel: req.params.id })
      .populate('creator', 'username')
      .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Subscribe/Unsubscribe to channel
// @route   PUT /api/channels/:id/subscribe
// @access  Private
const toggleSubscribe = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    const userId = req.user._id;
    const subscriberIndex = channel.subscribers.findIndex(
      id => id.toString() === userId.toString()
    );
    
    if (subscriberIndex > -1) {
      // Unsubscribe
      channel.subscribers.splice(subscriberIndex, 1);
    } else {
      // Subscribe
      channel.subscribers.push(userId);
    }
    
    await channel.save();
    
    res.json({
      subscriberCount: channel.subscribers.length,
      isSubscribed: subscriberIndex === -1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my channel
// @route   GET /api/channels/my-channel
// @access  Private/Creator
const getMyChannel = async (req, res) => {
  try {
    const channel = await Channel.findOne({ creator: req.user._id })
      .populate('creator', 'username');
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrUpdateChannel,
  getChannel,
  getChannelVideos,
  toggleSubscribe,
  getMyChannel,
};

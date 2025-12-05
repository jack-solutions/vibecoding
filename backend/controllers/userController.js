const User = require('../models/User');
const Channel = require('../models/Channel');

// @desc    Subscribe/Unsubscribe to a channel
// @route   PUT /api/users/subscribe/:channelId
// @access  Private
const subscribeToChannel = async (req, res, next) => {
    try {
        const channel = await Channel.findById(req.params.channelId);
        const currentUser = await User.findById(req.user._id);

        if (!channel) {
            res.status(404);
            throw new Error('Channel not found');
        }

        if (channel.creator.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('Cannot subscribe to your own channel');
        }

        if (channel.subscribers.includes(req.user._id)) {
            // Unsubscribe
            channel.subscribers = channel.subscribers.filter(id => id.toString() !== req.user._id.toString());
            currentUser.subscriptions = currentUser.subscriptions.filter(id => id.toString() !== channel._id.toString());
            await channel.save();
            await currentUser.save();
            res.json({ message: 'Unsubscribed successfully' });
        } else {
            // Subscribe
            channel.subscribers.push(req.user._id);
            currentUser.subscriptions.push(channel._id);
            await channel.save();
            await currentUser.save();
            res.json({ message: 'Subscribed successfully' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user subscriptions
// @route   GET /api/users/subscriptions
// @access  Private
const getSubscriptions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('subscriptions');
        res.json(user.subscriptions);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    subscribeToChannel,
    getSubscriptions
};

const Channel = require('../models/Channel');
const User = require('../models/User');

const createChannel = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const channel = await Channel.create({
            creator: req.user._id,
            name,
            description
        });
        res.status(201).json(channel);
    } catch (error) {
        next(error);
    }
};

const getChannelById = async (req, res, next) => {
    try {
        const channel = await Channel.findById(req.params.id).populate('videos');
        if (channel) {
            res.json(channel);
        } else {
            res.status(404);
            throw new Error('Channel not found');
        }
    } catch (error) {
        next(error);
    }
};

const toggleSubscribe = async (req, res, next) => {
    try {
        const channel = await Channel.findById(req.params.id);
        const user = await User.findById(req.user._id);

        if (!channel) {
            res.status(404);
            throw new Error('Channel not found');
        }

        if (channel.subscribers.includes(req.user._id)) {
            channel.subscribers = channel.subscribers.filter(id => id.toString() !== req.user._id.toString());
            user.subscriptions = user.subscriptions.filter(id => id.toString() !== channel._id.toString());
        } else {
            channel.subscribers.push(req.user._id);
            user.subscriptions.push(channel._id);
        }

        await channel.save();
        await user.save();

        res.json({ message: 'Success', subscribers: channel.subscribers });
    } catch (error) {
        next(error);
    }
};

module.exports = { createChannel, getChannelById, toggleSubscribe };

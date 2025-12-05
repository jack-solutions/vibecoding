const mongoose = require('mongoose');

const channelSchema = mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String, default: '' },
    banner: { type: String, default: '' },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
}, { timestamps: true });

const Channel = mongoose.model('Channel', channelSchema);
module.exports = Channel;

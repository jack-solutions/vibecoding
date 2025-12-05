const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    isPublic: { type: Boolean, default: true }
}, { timestamps: true });

const Playlist = mongoose.model('Playlist', playlistSchema);
module.exports = Playlist;

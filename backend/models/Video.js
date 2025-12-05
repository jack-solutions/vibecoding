const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true }, // Path to file or S3 URL
    thumbnailUrl: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String }],
    duration: { type: Number, default: 0 } // In seconds
}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;

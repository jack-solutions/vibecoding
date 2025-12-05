const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    text: { type: String, required: true },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

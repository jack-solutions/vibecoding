const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Virtual for subscriber count
channelSchema.virtual('subscriberCount').get(function() {
  return this.subscribers.length;
});

module.exports = mongoose.model('Channel', channelSchema);

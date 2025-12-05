const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoUrl: String,
  thumbnail: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model("Video", videoSchema);

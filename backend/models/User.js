const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  role: {
    type: String,
    enum: ["admin", "creator", "viewer"],
    default: "viewer"
  }
});

module.exports = mongoose.model("User", userSchema);

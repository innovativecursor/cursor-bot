// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: String,
  displayName: String,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("User", userSchema);
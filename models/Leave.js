const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  userId: String,
  username: String,
  displayName: String,
  date: String, // YYYY-MM-DD
  reason: String,
  halfDay: { type: String, enum: ['full', 'first', 'second'], default: 'full' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Leave", leaveSchema);


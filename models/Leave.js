// models/Leave.js
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  userId: String,
  username: String,
  date: String,
  reason: String,
  displayName: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Leave", leaveSchema);

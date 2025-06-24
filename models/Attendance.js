// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: String,
  username: String,
  displayName: String,
  date: String, // YYYY-MM-DD stored as string
  firstHalfPresent: { type: Boolean, default: true },
  secondHalfPresent: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  autoMarkedAbsent: { type: Boolean, default: false },
  markedByHR: { type: Boolean, default: false },
  modifiedByHR: { type: Boolean, default: false },
  modifiedAt: { type: Date },
  hrNote: { type: String, default: "" },
});

attendanceSchema.virtual("status").get(function () {
  if (!this.firstHalfPresent && !this.secondHalfPresent) {
    return "Absent";
  } else if (this.firstHalfPresent && this.secondHalfPresent) {
    return "Present";
  } else {
    return "Partial";
  }
});

attendanceSchema.set("toObject", { virtuals: true });
attendanceSchema.set("toJSON", { virtuals: true });

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ userId: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);

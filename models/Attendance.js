// models/Attendance.js - Updated version
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: String,
  username: String,
  displayName: String,
  date: String, // YYYY-MM-DD stored as string
  firstHalfPresent: { type: Boolean, default: true },
  secondHalfPresent: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  
  // Auto-marked absent fields
  autoMarkedAbsent: { type: Boolean, default: false },
  
  // HR management fields
  markedByHR: { type: Boolean, default: false },
  modifiedByHR: { type: Boolean, default: false },
  modifiedAt: { type: Date },
  hrNote: { type: String, default: "" },
  
  // Additional metadata
  ipAddress: String,
  userAgent: String
});

attendanceSchema.virtual('formattedDate').get(function () {
  const d = this.date;
  if (!d) return '';
  const [year, month, day] = d.split('-');
  return `${day}-${month}-${year}`;
});

attendanceSchema.virtual('attendanceStatus').get(function () {
  if (!this.firstHalfPresent && !this.secondHalfPresent) {
    return 'Absent';
  } else if (this.firstHalfPresent && this.secondHalfPresent) {
    return 'Present';
  } else if (this.firstHalfPresent && !this.secondHalfPresent) {
    return 'First Half Present';
  } else if (!this.firstHalfPresent && this.secondHalfPresent) {
    return 'Second Half Present';
  }
});

attendanceSchema.virtual('markedBy').get(function () {
  if (this.autoMarkedAbsent) return 'System (Auto)';
  if (this.markedByHR) return 'HR';
  return 'Self';
});

attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

// Index for better query performance
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ userId: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: String,
  username: String,
  displayName: String,
  date: { type: Date, default: Date.now },
});

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function () {
  const d = this.date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
});

// Include virtuals in JSON and object output
attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Attendance", attendanceSchema);

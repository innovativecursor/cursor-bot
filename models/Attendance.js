const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: String,
  username: String,
  displayName: String,
  date: String, // YYYY-MM-DD stored as string
  firstHalfPresent: { type: Boolean, default: true },
  secondHalfPresent: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

attendanceSchema.virtual('formattedDate').get(function () {
  const d = this.date;
  if (!d) return '';
  const [year, month, day] = d.split('-');
  return `${day}-${month}-${year}`;
});

attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Attendance", attendanceSchema);

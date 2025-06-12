const mongoose = require("mongoose");
const moment = require("moment-timezone");
const connectDB = require("../db.js");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const User = require("../models/User");
require("dotenv").config();

async function markAbsentees() {
  await connectDB();

  const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
  const dayOfWeek = moment().tz("Asia/Kolkata").day();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log("Weekend — skipping absentee marking.");
    return mongoose.disconnect();
  }

  const users = await User.find();

  for (const user of users) {
    const [hasAttendance, hasLeave] = await Promise.all([
      Attendance.findOne({ userId: user.userId, date: today }),
      Leave.findOne({ userId: user.userId, date: today }),
    ]);

    if (!hasAttendance && !hasLeave) {
      await Attendance.create({
        userId: user.userId,
        username: user.username,
        displayName: user.displayName,
        date: today,
        createdAt: moment().tz("Asia/Kolkata").toISOString(),
        firstHalfPresent: false,
        secondHalfPresent: false,
        autoMarkedAbsent: true,
      });
      console.log(`Marked absent: ${user.username}`);
    }
  }

  await mongoose.disconnect();
  console.log("✅ Absentee check completed.");
}

markAbsentees().catch((err) => {
  console.error("Error in absentee script:", err);
  mongoose.disconnect();
});

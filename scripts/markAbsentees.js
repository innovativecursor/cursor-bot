const mongoose = require("mongoose");
const moment = require("moment-timezone");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Leave = require("../models/Leave");

async function markAbsentees() {
  const nowIST = moment().tz("Asia/Kolkata");
  const day = nowIST.day(); // 0 = Sunday, 6 = Saturday

  if (day === 0 || day === 6) {
    console.log("🛑 It's weekend. Script skipped.");
    return;
  }

  const today = nowIST.format("YYYY-MM-DD");
  console.log(`📅 Running absentee marking for ${today}`);

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error("❌ MONGODB_URI is not defined in environment variables.");
      process.exit(1);
    }

    await mongoose.connect(uri, { dbName: "attendanceDB" });

    const users = await User.find({ isActive: true });

    for (const user of users) {
      const { userId, username, displayName } = user;

      const [attendance, leave] = await Promise.all([
        Attendance.findOne({ userId, date: today }),
        Leave.findOne({ userId, date: today }),
      ]);

      if (attendance) {
        console.log(`✅ ${displayName} already marked attendance.`);
        continue;
      }

      if (leave) {
        console.log(`📌 ${displayName} is on leave (${leave.halfDay}).`);
        continue;
      }

      await Attendance.create({
        userId,
        username,
        displayName,
        date: today,
        firstHalfPresent: false,
        secondHalfPresent: false,
        autoMarkedAbsent: true,
        createdAt: nowIST.toISOString(),
      });

      console.log(`❌ ${displayName} marked absent automatically.`);
    }

    console.log("✅ Auto-absent marking completed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error in absentee marking:", err);
    process.exit(1);
  }
}

markAbsentees();

const express = require("express");
const router = express.Router();
const Attendance = require("../../models/Attendance.js");

// GET /api/attendance
router.get("/", async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

// GET /api/attendance/absentees?date=YYYY-MM-DD
router.get("/absentees", async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) {
      return res
        .status(400)
        .json({ error: "Missing 'date' query param (YYYY-MM-DD)" });
    }

    const absentees = await Attendance.find({
      date,
      autoMarkedAbsent: true,
    });

    res.json(absentees);
  } catch (err) {
    console.error("Error fetching absentees:", err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;

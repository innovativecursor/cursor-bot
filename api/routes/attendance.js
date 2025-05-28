const express = require('express');
const router = express.Router();
const Attendance = require('../../models/Attendance.js');

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

module.exports = router;

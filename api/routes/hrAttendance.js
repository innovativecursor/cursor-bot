// api/routes/hrAttendance.js
const express = require("express");
const router = express.Router();
const {
  getAllAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAllUsers,
  getUserById,
} = require("../controllers/hrAttendanceController");

// GET /api/hr/attendance - Get all attendance records with filters
// Query params: ?date=YYYY-MM-DD&userId=123&page=1&limit=50
router.get("/attendance", getAllAttendance);

// POST /api/hr/attendance - Mark attendance for a user
// Body: { userId, date, firstHalfPresent, secondHalfPresent, note }
router.post("/attendance", markAttendance);

// PUT /api/hr/attendance/:id - Update attendance record
// Body: { firstHalfPresent, secondHalfPresent, note }
router.put("/attendance/:id", updateAttendance);

// DELETE /api/hr/attendance/:id - Delete attendance record
router.delete("/attendance/:id", deleteAttendance);

// GET /api/hr/users - Get all users
router.get("/users", getAllUsers);

// GET /api/hr/users/:id - Get a single user by ID
router.get("/users/:id", getUserById);

module.exports = router;

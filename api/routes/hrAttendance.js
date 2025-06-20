// api/routes/hrAttendance.js
const express = require('express');
const router = express.Router();
const {
  getAllAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  bulkAttendanceOperation,
  getAllUsers
} = require('../controllers/hrAttendanceController');

// GET /api/hr/attendance - Get all attendance records with filters
// Query params: ?date=YYYY-MM-DD&userId=123&page=1&limit=50
router.get('/attendance', getAllAttendance);

// POST /api/hr/attendance - Mark attendance for a user
// Body: { userId, date, firstHalfPresent, secondHalfPresent, note }
router.post('/attendance', markAttendance);

// PUT /api/hr/attendance/:id - Update attendance record
// Body: { firstHalfPresent, secondHalfPresent, note }
router.put('/attendance/:id', updateAttendance);

// DELETE /api/hr/attendance/:id - Delete attendance record
router.delete('/attendance/:id', deleteAttendance);

// POST /api/hr/attendance/bulk - Bulk operations
// Body: { operation: "mark|delete", data: [...] }
router.post('/attendance/bulk', bulkAttendanceOperation);

// GET /api/hr/users - Get all users
router.get('/users', getAllUsers);

module.exports = router;
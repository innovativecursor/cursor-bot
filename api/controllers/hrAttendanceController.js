// api/controllers/hrAttendanceController.js
const Attendance = require("../../models/Attendance");
const Leave = require("../../models/Leave");
const User = require("../../models/User");
const moment = require("moment-timezone");

// GET /api/hr/attendance - Get all attendance records with filters
const getAllAttendance = async (req, res) => {
  try {
    const { date, userId, page = 1, limit = 50 } = req.query;

    let query = {};

    // Filter by date if provided
    if (date) {
      query.date = date;
    }

    // Filter by userId if provided
    if (userId) {
      query.userId = userId;
    }

    const skip = (page - 1) * limit;

    const attendance = await Attendance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
};

// POST /api/hr/attendance - Mark attendance for a user
const markAttendance = async (req, res) => {
  try {
    const {
      userId,
      date,
      firstHalfPresent = true,
      secondHalfPresent = true,
      note = "",
    } = req.body;

    // Validation
    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        message: "userId and date are required",
      });
    }

    // Validate date format (YYYY-MM-DD)
    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Check if both halves are marked absent
    if (!firstHalfPresent && !secondHalfPresent) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot mark both halves as absent. Use absence record instead.",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({ userId, date });
    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance already exists for this user and date",
        data: existingAttendance,
      });
    }

    // Check for conflicting leave
    const existingLeave = await Leave.findOne({ userId, date });
    if (existingLeave) {
      // Check for conflicts between leave and attendance
      if (existingLeave.halfDay === "full") {
        return res.status(409).json({
          success: false,
          message: "User has full day leave applied for this date",
        });
      } else if (existingLeave.halfDay === "first" && firstHalfPresent) {
        return res.status(409).json({
          success: false,
          message: "User has first half leave applied for this date",
        });
      } else if (existingLeave.halfDay === "second" && secondHalfPresent) {
        return res.status(409).json({
          success: false,
          message: "User has second half leave applied for this date",
        });
      }
    }

    // Create attendance record
    const attendance = await Attendance.create({
      userId,
      username: user.username,
      displayName: user.displayName,
      date,
      firstHalfPresent,
      secondHalfPresent,
      createdAt: moment().tz("Asia/Kolkata").toISOString(),
      markedByHR: true,
      hrNote: note,
    });

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
};

// PUT /api/hr/attendance/:id - Update attendance record
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstHalfPresent, secondHalfPresent, note = "" } = req.body;

    // Find existing attendance
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    // Check for conflicting leave if modifying attendance
    const existingLeave = await Leave.findOne({
      userId: attendance.userId,
      date: attendance.date,
    });

    if (existingLeave) {
      if (existingLeave.halfDay === "first" && firstHalfPresent === true) {
        return res.status(409).json({
          success: false,
          message: "Cannot mark first half present - user has first half leave",
        });
      } else if (
        existingLeave.halfDay === "second" &&
        secondHalfPresent === true
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot mark second half present - user has second half leave",
        });
      } else if (existingLeave.halfDay === "full") {
        return res.status(409).json({
          success: false,
          message: "Cannot modify attendance - user has full day leave",
        });
      }
    }

    // Update attendance
    const updateData = {
      modifiedAt: moment().tz("Asia/Kolkata").toISOString(),
      modifiedByHR: true,
      hrNote: note,
    };

    if (firstHalfPresent !== undefined) {
      updateData.firstHalfPresent = firstHalfPresent;
    }
    if (secondHalfPresent !== undefined) {
      updateData.secondHalfPresent = secondHalfPresent;
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

// DELETE /api/hr/attendance/:id - Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    await Attendance.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete attendance record",
      error: error.message,
    });
  }
};

// GET /api/hr/users - Get all users for HR dashboard
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ displayName: 1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAllUsers,
};

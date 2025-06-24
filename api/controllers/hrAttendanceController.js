// controllers/hrAttendanceController.js
const Attendance = require("../../models/Attendance");
const Leave = require("../../models/Leave");
const User = require("../../models/User");
const moment = require("moment-timezone");

const getAllAttendance = async (req, res) => {
  try {
    const { date, userId, page = 1, limit = 50 } = req.query;

    let query = {};
    if (date) query.date = date;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;
    const attendanceList = await Attendance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    const enriched = await Promise.all(
      attendanceList.map(async (record) => {
        const leave = await Leave.findOne({
          userId: record.userId,
          date: record.date,
        });

        let status = record.status; // default from virtual

        if (leave) {
          if (leave.halfDay === "full") status = "Leave";
          else if (
            (leave.halfDay === "first" && record.firstHalfPresent) ||
            (leave.halfDay === "second" && record.secondHalfPresent)
          ) {
            status = "Conflict (Leave & Present)";
          } else {
            status = `Partial Leave (${leave.halfDay})`;
          }
        }

        return {
          ...record.toObject(),
          status,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
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

const markAttendance = async (req, res) => {
  try {
    const {
      userId,
      date,
      firstHalfPresent = true,
      secondHalfPresent = true,
      note = "",
    } = req.body;

    if (!userId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "userId and date are required" });
    }

    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const existingAttendance = await Attendance.findOne({ userId, date });
    if (existingAttendance) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Attendance already exists",
          data: existingAttendance,
        });
    }

    const existingLeave = await Leave.findOne({ userId, date });
    if (existingLeave) {
      if (existingLeave.halfDay === "full") {
        return res
          .status(409)
          .json({ success: false, message: "User has full day leave" });
      } else if (existingLeave.halfDay === "first" && firstHalfPresent) {
        return res
          .status(409)
          .json({ success: false, message: "User has first half leave" });
      } else if (existingLeave.halfDay === "second" && secondHalfPresent) {
        return res
          .status(409)
          .json({ success: false, message: "User has second half leave" });
      }
    }

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

    res
      .status(201)
      .json({ success: true, message: "Attendance marked", data: attendance });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to mark attendance",
        error: error.message,
      });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstHalfPresent, secondHalfPresent, note = "" } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    const leave = await Leave.findOne({
      userId: attendance.userId,
      date: attendance.date,
    });
    if (leave) {
      if (leave.halfDay === "first" && firstHalfPresent === true) {
        return res
          .status(409)
          .json({ success: false, message: "First half leave conflict" });
      } else if (leave.halfDay === "second" && secondHalfPresent === true) {
        return res
          .status(409)
          .json({ success: false, message: "Second half leave conflict" });
      } else if (leave.halfDay === "full") {
        return res
          .status(409)
          .json({ success: false, message: "Full day leave conflict" });
      }
    }

    const updateData = {
      modifiedAt: moment().tz("Asia/Kolkata").toISOString(),
      modifiedByHR: true,
      hrNote: note,
    };
    if (firstHalfPresent !== undefined)
      updateData.firstHalfPresent = firstHalfPresent;
    if (secondHalfPresent !== undefined)
      updateData.secondHalfPresent = secondHalfPresent;

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    res.json({
      success: true,
      message: "Attendance updated",
      data: updatedAttendance,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update attendance",
        error: error.message,
      });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    await Attendance.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Attendance deleted",
      data: attendance,
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete attendance",
        error: error.message,
      });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ displayName: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch user",
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
  getUserById,
};

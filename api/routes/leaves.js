const express = require("express");
const router = express.Router();
const Leave = require("../../models/Leave.js");

// GET /api/leaves?userId=...&date=...
router.get("/", async (req, res) => {
  try {
    const { userId, date, page = 1, limit = 50 } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (date) query.date = date;

    const skip = (page - 1) * limit;

    const leaves = await Leave.find(query)
      .sort({ date: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Leave.countDocuments(query);

    res.json({
      success: true,
      data: leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch leave records." });
  }
});

// POST /api/leaves
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      username,
      displayName,
      date,
      reason,
      halfDay = "full",
    } = req.body;

    if (!userId || !username || !displayName || !date || !reason) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields." });
    }

    const existing = await Leave.findOne({
      userId,
      date,
      $or: [{ halfDay }, { halfDay: "full" }],
    });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Leave already exists for this date/half.",
        });
    }

    const leave = await Leave.create({
      userId,
      username,
      displayName,
      date,
      reason,
      halfDay,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    console.error("Error creating leave:", err);
    res.status(500).json({ success: false, error: "Failed to create leave." });
  }
});

// DELETE /api/leaves/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Leave.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, error: "Leave not found." });
    }
    res.json({ success: true, message: "Leave deleted successfully." });
  } catch (err) {
    console.error("Error deleting leave:", err);
    res.status(500).json({ success: false, error: "Failed to delete leave." });
  }
});

module.exports = router;

// controllers/leaveController.js
const Leave = require("../../models/Leave.js");

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ date: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res.status(500).json({ success: false, error: "Failed to fetch leave records." });
  }
};

module.exports = {
  getAllLeaves,
};

// routes/leave.js
const express = require("express");
const router = express.Router();
const { getAllLeaves } = require("../controllers/leaveController");

router.get("/", getAllLeaves);

module.exports = router;

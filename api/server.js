const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = require("../shared/db.js")
connectDB();

// Routes
const leaveRoutes = require("./routes/leaves.js");
app.use("/api/leaves", leaveRoutes);

const hrAttendanceRoutes = require("./routes/hrAttendance.js");
app.use("/api/hr", hrAttendanceRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));

module.exports = app;

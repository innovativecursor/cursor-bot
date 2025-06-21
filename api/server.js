const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: "attendanceDB",
});

// Routes
const leaveRoutes = require("./routes/leaves");
app.use("/api/leaves", leaveRoutes);

const attendanceRoutes = require("./routes/attendance");
app.use("/api/attendance", attendanceRoutes);

const hrAttendanceRoutes = require("./routes/hrAttendance");
app.use("/api/hr", hrAttendanceRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));

module.exports = app;

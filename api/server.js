const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Secure CORS config
app.use(
  cors({
    origin: "https://dashboard.innovativecursor.com",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
  })
);

// ✅ Custom Origin Check Middleware
app.use((req, res, next) => {
  const allowedOrigin = "https://dashboard.innovativecursor.com";
  const origin = req.get("Origin") || req.get("Referer");

  if (!origin || origin.startsWith(allowedOrigin)) {
    return next();
  }

  return res.status(403).json({ message: "Forbidden: Invalid origin" });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = require("../shared/db.js");
connectDB();

// Routes
const leaveRoutes = require("./routes/leaves.js");
app.use("/api/leaves", leaveRoutes);

const hrAttendanceRoutes = require("./routes/hrAttendance.js");
app.use("/api/hr", hrAttendanceRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));

module.exports = app;

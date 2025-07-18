const { SlashCommandBuilder } = require("discord.js");
const Attendance = require("../models/Attendance.js");
const Leave = require("../models/Leave.js");
const User = require("../models/User.js");
const moment = require("moment-timezone");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("attendance")
    .setDescription("Mark your attendance for today")
    .addStringOption((option) =>
      option
        .setName("halves")
        .setDescription("Two digits for attendance halves, e.g. '1 0' or '0 1'")
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const displayName =
      interaction.member?.nickname ||
      interaction.user.globalName ||
      interaction.user.username;

    const nowIST = moment().tz("Asia/Kolkata");
    const today = nowIST.format("YYYY-MM-DD");
    const currentHour = nowIST.hour();
    const dayOfWeek = nowIST.day();

    // ❌ Block weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return interaction.reply({
        content: "❌ Attendance is not allowed on weekends (Saturday or Sunday).",
        ephemeral: true,
      });
    }

    // ❌ Block after 6 PM
    if (currentHour >= 18) {
      return interaction.reply({
        content: "❌ Attendance cannot be marked after 6:00 PM IST.",
        ephemeral: true,
      });
    }

    let firstHalfPresent = true;
    let secondHalfPresent = true;

    const halvesInput = interaction.options.getString("halves");
    if (halvesInput) {
      const halves = halvesInput.trim().split(/\s+/).map((h) => h.trim());

      if (halves.length !== 2 || !halves.every((h) => h === "0" || h === "1")) {
        return interaction.reply({
          content:
            "❌ Invalid halves input. Use two digits: '1 0' or '0 1', or omit for full day.",
          ephemeral: true,
        });
      }

      firstHalfPresent = halves[0] === "1";
      secondHalfPresent = halves[1] === "1";

      if (!firstHalfPresent && !secondHalfPresent) {
        return interaction.reply({
          content: "❌ You cannot mark both halves as absent.",
          ephemeral: true,
        });
      }
    }

    try {
      // 🧠 Register user if not exists
      const existingUser = await User.findOne({ userId });
      if (!existingUser) {
        await User.create({ userId, username, displayName });
      }

      // ❌ Block if leave applied
      const existingLeave = await Leave.findOne({ userId, date: today });
      if (existingLeave) {
        return interaction.reply({
          content:
            "❌ You have already applied for leave today. Attendance not allowed.",
          ephemeral: true,
        });
      }

      // ❌ Block if already marked
      const existingAttendance = await Attendance.findOne({ userId, date: today });
      if (existingAttendance) {
        return interaction.reply({
          content: "✅ You've already marked attendance for today.",
          ephemeral: true,
        });
      }

      // ✅ Save attendance
      await Attendance.create({
        userId,
        username,
        displayName,
        date: today,
        createdAt: nowIST.toISOString(),
        firstHalfPresent,
        secondHalfPresent,
      });

      const presentHalves = [];
      if (firstHalfPresent) presentHalves.push("First half");
      if (secondHalfPresent) presentHalves.push("Second half");

      return interaction.reply({
        content: `✅ Attendance marked successfully for: ${presentHalves.join(" and ")} today.`,
      });
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Failed to mark attendance.",
        ephemeral: true,
      });
    }
  },
};

const { SlashCommandBuilder } = require("discord.js");
const Attendance = require("../models/Attendance.js");
const Leave = require("../models/Leave.js");
const moment = require("moment");

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
    const today = moment().format("YYYY-MM-DD");

    // Parse halves input
    let firstHalfPresent = true;
    let secondHalfPresent = true;

    const halvesInput = interaction.options.getString("halves");
    if (halvesInput) {
      const halves = halvesInput
        .trim()
        .split(/\s+/)
        .map((h) => h.trim());

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
      const existingLeave = await Leave.findOne({
        userId,
        date: today,
        halfDay: "full",
      });

      if (existingLeave) {
        return interaction.reply({
          content:
            "❌ You have already applied for full day leave today. Attendance not allowed.",
          ephemeral: true,
        });
      }

      const existingAttendance = await Attendance.findOne({
        userId,
        date: today,
      });

      if (existingAttendance) {
        return interaction.reply({
          content: "You've already marked attendance for today!",
          ephemeral: true,
        });
      }

      await Attendance.create({
        userId,
        username,
        displayName,
        date: today,
        createdAt: new Date().toISOString(),
        firstHalfPresent,
        secondHalfPresent,
      });

      // Auto mark leave for absent halves
      const leaveMessages = [];
      if (!firstHalfPresent) {
        await Leave.create({
          userId,
          username,
          displayName,
          date: today,
          reason: "Absent for first half",
          halfDay: "first",
          createdAt: new Date(),
        });
        leaveMessages.push("📝 Leave applied for first half.");
      }

      if (!secondHalfPresent) {
        await Leave.create({
          userId,
          username,
          displayName,
          date: today,
          reason: "Absent for second half",
          halfDay: "second",
          createdAt: new Date(),
        });
        leaveMessages.push("📝 Leave applied for second half.");
      }

      const presentHalves = [];
      if (firstHalfPresent) presentHalves.push("First half");
      if (secondHalfPresent) presentHalves.push("Second half");

      return interaction.reply({
        content: `✅ Attendance marked for: ${presentHalves.join(" and ")} today.\n${leaveMessages.join("\n")}`,
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

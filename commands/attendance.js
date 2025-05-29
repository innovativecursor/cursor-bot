const { SlashCommandBuilder } = require("discord.js");
const Attendance = require("../models/Attendance.js");
const Leave = require("../models/Leave.js");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("attendance")
    .setDescription("Mark your attendance for today"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const displayName =
      interaction.member?.nickname ||
      interaction.user.globalName ||
      interaction.user.username;
    const date = moment().format("YYYY-MM-DD");

    try {
      const existingLeave = await Leave.findOne({ userId, date });
      if (existingLeave) {
        return interaction.reply({
          content: "❌ You have already applied for leave today. Attendance not allowed.",
          ephemeral: true,
        });
      }

      const existingAttendance = await Attendance.findOne({ userId, date });
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
        date, // Store date consistently as string
        createdAt: new Date(),
      });

      interaction.reply({
        content: "✅ Attendance marked successfully!",
      });
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "❌ Failed to mark attendance.",
        ephemeral: true,
      });
    }
  },
};

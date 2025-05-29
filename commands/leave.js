const { SlashCommandBuilder } = require("discord.js");
const Leave = require("../models/Leave.js");
const Attendance = require("../models/Attendance.js");
const moment = require("moment");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Apply for leave")
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for your leave")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const displayName =
      interaction.member?.nickname ||
      interaction.user.globalName ||
      interaction.user.username;
    const date = moment().format("YYYY-MM-DD");
    const reason = interaction.options.getString("reason");

    try {
      const existingAttendance = await Attendance.findOne({ userId, date });
      if (existingAttendance) {
        return interaction.reply({
          content: "❌ You have already marked attendance today. Leave not allowed.",
          ephemeral: true,
        });
      }

      const existingLeave = await Leave.findOne({ userId, date });
      if (existingLeave) {
        return interaction.reply({
          content: "You've already applied for leave today!",
          ephemeral: true,
        });
      }

      await Leave.create({
        userId,
        username,
        displayName,
        date,
        reason,
        createdAt: new Date(),
      });

      interaction.reply(
        `📝 Leave applied for ${displayName} on ${date}.\nReason: ${reason}`
      );
    } catch (error) {
      console.error("Leave command error:", error);
      interaction.reply({
        content: "❌ Failed to apply for leave.",
        ephemeral: true,
      });
    }
  },
};

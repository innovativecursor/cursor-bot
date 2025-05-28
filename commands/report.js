const Attendance = require("../models/Attendance");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("View attendance report")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to view report for")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    try {
      const records = await Attendance.find({ userId: user.id })
        .sort({ date: 1 })
        .lean();

      if (records.length === 0) {
        return interaction.reply({
          content: `${user.displayName} has no attendance records.`,
          ephemeral: true,
        });
      }

      const dates = records
        .slice(0, 20)
        .map((r) => r.date)
        .join(", ");
      const replyContent =
        records.length > 20
          ? `Attendance for ${user.displayName} (showing first 20): ${dates}`
          : `Attendance for ${user.displayName}: ${dates}`;

      return interaction.reply({
        content: replyContent,
        ephemeral: true,
      });
    } catch (err) {
      console.error("Error fetching attendance report:", err);
      return interaction.reply({
        content: "Failed to fetch attendance report.",
        ephemeral: true,
      });
    }
  },
};

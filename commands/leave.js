const { SlashCommandBuilder } = require("discord.js");
const Leave = require("../models/Leave.js");
const Attendance = require("../models/Attendance.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Apply for leave")
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for your leave")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("half")
        .setDescription("Leave half-day option: full, first, second")
        .setRequired(false)
        .addChoices(
          { name: "Full day", value: "full" },
          { name: "First half", value: "first" },
          { name: "Second half", value: "second" }
        )
    ),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const displayName =
        interaction.member?.nickname ||
        interaction.user.globalName ||
        interaction.user.username;
      const date = new Date().toISOString().split("T")[0];
      const reason = interaction.options.getString("reason");
      const halfDay = interaction.options.getString("half") || "full";

      // Find attendance for the user on that date
      const attendance = await Attendance.findOne({ userId, date });

      if (attendance) {
        // Check attendance vs leave half logic
        if (halfDay === "full") {
          // If full day leave requested but any attendance present, reject
          if (attendance.firstHalfPresent && attendance.secondHalfPresent) {
            return interaction.reply({
              content:
                "❌ You have marked full attendance today. Leave not allowed.",
              ephemeral: true,
            });
          }
        } else if (halfDay === "first") {
          if (attendance.firstHalfPresent) {
            return interaction.reply({
              content:
                "❌ You have marked presence for the first half. Leave for first half not allowed.",
              ephemeral: true,
            });
          }
        } else if (halfDay === "second") {
          if (attendance.secondHalfPresent) {
            return interaction.reply({
              content:
                "❌ You have marked presence for the second half. Leave for second half not allowed.",
              ephemeral: true,
            });
          }
        }
      }

      // Check if leave already exists for the half or full day
      const existingLeave = await Leave.findOne({
        userId,
        date,
        $or: [{ halfDay }, { halfDay: "full" }],
      });

      if (existingLeave) {
        return interaction.reply({
          content: `❌ Leave already applied for this ${halfDay} day.`,
          ephemeral: true,
        });
      }

      await Leave.create({
        userId,
        username,
        displayName,
        date,
        reason,
        halfDay,
        createdAt: new Date(),
      });

      await interaction.reply(
        `📝 Leave applied for ${displayName} on ${date} (${halfDay} day).\nReason: ${reason}`
      );
    } catch (error) {
      console.error("Leave command error:", error);
      await interaction.reply({
        content: "❌ Failed to apply for leave.",
        ephemeral: true,
      });
    }
  },
};

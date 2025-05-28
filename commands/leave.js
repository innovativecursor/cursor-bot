const { SlashCommandBuilder } = require("discord.js");
const Leave = require("../models/Leave.js");

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
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const displayName =
        interaction.member?.nickname ||
        interaction.user.globalName ||
        interaction.user.username;
      const date = new Date().toISOString().split("T")[0];
      const reason = interaction.options.getString("reason");

      await Leave.create({
        userId,
        username,
        date,
        reason,
        displayName,
        date: new Date(),
      });

      await interaction.reply(
        `📝 Leave applied for ${displayName} on ${date}.\nReason: ${reason}`
      );
    } catch (error) {
      console.error("Leave command error:", error);
      await interaction.reply({
        content: "❌ Failed to apply for leave.",
        flags: InteractionResponseFlags.Ephemeral,
      });
    }
  },
};

const { SlashCommandBuilder } = require("discord.js");
const Attendance = require("../models/Attendance.js");
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
      // Example input: "1 0" or "0 1"
      const halves = halvesInput.trim().split(/\s+/);

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
      // Check if leave exists for today - disallow attendance if leave exists
      const existingLeave = await require("../models/Leave.js").findOne({
        userId,
        date: today,
      });
      if (existingLeave) {
        return interaction.reply({
          content:
            "❌ You have already applied for leave today. Attendance not allowed.",
          ephemeral: true,
        });
      }

      // Check if attendance already exists today
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
        firstHalfPresent,
        secondHalfPresent,
      });

      const presentHalves = [];
      if (firstHalfPresent) presentHalves.push("First half");
      if (secondHalfPresent) presentHalves.push("Second half");

      return interaction.reply({
        content: `✅ Attendance marked successfully for: ${presentHalves.join(
          " and "
        )} today.`,
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

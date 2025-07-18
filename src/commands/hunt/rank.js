const { SlashCommandBuilder } = require('discord.js');
const { getAllUserPoints } = require('../../services/pointsService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Show user rankings'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userPoints = getAllUserPoints(guildId);

        if (!userPoints || Object.keys(userPoints).length === 0) {
            return interaction.reply('No points recorded yet.');
        }

        const sorted = Object.entries(userPoints)
            .sort(([, pointsA], [, pointsB]) => pointsB - pointsA);

        const leaderboard = await Promise.all(sorted.map(async ([userId, points], index) => {
            const member = await interaction.guild.members.fetch(userId).catch(() => null);
            const displayName = member ? member.displayName : `Unknown User (${userId})`;
            return `#${index + 1}: ${displayName} — ${points.toFixed(1)} points`;
        }));

        await interaction.reply({
            content: `🏆 **Leaderboard** 🏆\n\n${leaderboard.join('\n')}`,
            ephemeral: false,
        });
    },
};

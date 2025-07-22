const { SlashCommandBuilder } = require('discord.js');
const { getAllUserPoints, getChannelPoints } = require('../../services/pointsService');
const { getHunt } = require('../../services/huntData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Show user rankings'),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        // If running inside a thread, use parentId for points lookup
        const channelId = interaction.channel.isThread() ? interaction.channel.parentId : interaction.channel.id;

        const userPoints = getAllUserPoints(guildId, channelId);

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

        const channelPoints = getChannelPoints(guildId, channelId);
        const huntConfig = getHunt(channelId);
        const channelGoal = huntConfig?.goal || 0;

        await interaction.reply({
            content:
                `📊 **Channel Points:** ${channelPoints} / ${channelGoal} Goal\n\n` +
                `🏆 **Leaderboard** 🏆\n\n` +
                `${leaderboard.join('\n')}`,
            ephemeral: false,
        });
    },
};

const { SlashCommandBuilder } = require('discord.js');
const { getHunt, saveHuntThreads, loadHuntThreads } = require('../../services/huntData');
const {
    addUserPoints,
    addServerPoints,
    getUserPoints,
} = require('../../services/pointsService');

function extractKayaId(input) {
    try {
        const url = new URL(input);
        return url.searchParams.get('climb_id');
    } catch (err) {
        return input;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('found')
        .setDescription('Submit a find')
        .addIntegerOption(option =>
            option.setName('set')
                .setDescription('Set number')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('kaya_id')
                .setDescription('Kaya ID or full URL')
                .setRequired(true)),

    async execute(interaction) {
        const channelId = interaction.channel.id;
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const setNumber = interaction.options.getInteger('set');
        const kayaIdInput = interaction.options.getString('kaya_id');
        const kayaId = extractKayaId(kayaIdInput);

        const huntConfig = getHunt(channelId);
        if (!huntConfig) {
            return interaction.reply({ content: 'No active hunt in this channel.', ephemeral: true });
        }

        const threadsFile = await loadHuntThreads(guildId);
        if (!threadsFile.threads || threadsFile.threads.length === 0) {
            return interaction.reply({ content: 'Hunt threads data missing.', ephemeral: true });
        }

        const foundThread = threadsFile.threads.find(t => t.set == setNumber && t.kayaId == kayaId);
        if (!foundThread) {
            return interaction.reply({ content: 'Invalid set number or Kaya ID for this hunt.', ephemeral: true });
        }

        if (!threadsFile.submissions[setNumber]) {
            threadsFile.submissions[setNumber] = [];
        }

        if (threadsFile.submissions[setNumber].includes(userId)) {
            return interaction.reply({ content: `You've already submitted a find for set ${setNumber}.`, ephemeral: true });
        }

        const countForThisSet = threadsFile.submissions[setNumber].length;
        const userPoints = Math.max(3 - countForThisSet * 0.1, 1);
        addUserPoints(guildId, userId, userPoints);

        // Only award server points if this set hasn't scored yet
        if (!threadsFile.serverPointsAwardedForSet.includes(String(setNumber))) {
            const relatedThreads = threadsFile.threads.filter(t => t.set == setNumber);
            const hintsGiven = Math.max(...relatedThreads.map(t => t.hintsGiven || 0));
            const serverPoints = huntConfig.hints + 1 - hintsGiven;

            addServerPoints(guildId, channelId, serverPoints);
            threadsFile.serverPointsAwardedForSet.push(String(setNumber));
        }

        threadsFile.submissions[setNumber].push(userId);
        await saveHuntThreads(guildId, threadsFile);

        await interaction.reply({
            content: `✅ Found recorded! You earned ${userPoints} points.\nTotal: ${getUserPoints(guildId, userId)} points.`,
            ephemeral: true,
        });
    },
};

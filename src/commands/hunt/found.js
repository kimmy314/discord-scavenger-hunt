const { SlashCommandBuilder } = require('discord.js');
const { getHunt, saveHuntThreads, loadHuntThreads } = require('../../services/huntData');
const {
    addUserPoints,
    addChannelPoints,
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
        const channelId = interaction.channel.isThread() ? interaction.channel.parentId : interaction.channel.id;
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const setNumber = interaction.options.getInteger('set');
        const kayaIdInput = interaction.options.getString('kaya_id');
        const kayaId = String(extractKayaId(kayaIdInput)).trim();

        const huntConfig = getHunt(channelId);
        if (!huntConfig) {
            return interaction.reply({ content: 'No active hunt in this channel.', ephemeral: true });
        }

        const threadsFile = await loadHuntThreads(guildId);
        if (!threadsFile.threads || threadsFile.threads.length === 0) {
            return interaction.reply({ content: 'Hunt threads data missing.', ephemeral: true });
        }

        const foundThreadData = threadsFile.threads.find(
            t => t.set == setNumber && String(t.kayaId).trim() === kayaId && t.channelId === channelId
        );

        if (!foundThreadData) {
            return interaction.reply({ content: 'Invalid set number or Kaya ID for this hunt.', ephemeral: true });
        }

        const thread = await interaction.guild.channels.fetch(foundThreadData.threadId);
        if (!threadsFile.submissions[channelId]) {
            threadsFile.submissions[channelId] = {};
        }

        if (!threadsFile.submissions[channelId][setNumber]) {
            threadsFile.submissions[channelId][setNumber] = [];
        }

        if (threadsFile.submissions[channelId][setNumber].includes(userId)) {
            return interaction.reply({
                content: `You've already submitted a find for set ${setNumber} in this channel.`,
                ephemeral: true,
            });
        }

        const countForThisSet = threadsFile.submissions[channelId][setNumber].length;
        const userPoints = Math.max(3 - countForThisSet * 0.1, 1);
        addUserPoints(guildId, channelId, userId, userPoints);

        let channelPoints = 0;
        let channelPointsMessage = '';

        if (!threadsFile.channelPointsAwardedForSet[channelId]) {
            threadsFile.channelPointsAwardedForSet[channelId] = [];
        }
        if (!threadsFile.channelPointsAwardedForSet[channelId].includes(String(setNumber))) {
            const relatedThreads = threadsFile.threads.filter(
                t => t.set == setNumber && t.channelId === channelId
            );
            const hintsGiven = Math.max(...relatedThreads.map(t => t.hintsGiven || 0));
            channelPoints = Math.max(huntConfig.hints - (hintsGiven - 1), 1);

            addChannelPoints(guildId, channelId, channelPoints);
            threadsFile.channelPointsAwardedForSet[channelId].push(String(setNumber));

            channelPointsMessage = `Channel earned ${channelPoints} points for this set. (Found with ${hintsGiven} hints given)`;
        } else {
            channelPointsMessage = `Channel already earned points for this set.`;
        }

        threadsFile.submissions[channelId][setNumber].push(userId);
        await saveHuntThreads(guildId, threadsFile);

        await interaction.reply({
            content: `✅ Found recorded! You earned ${userPoints} points.\nTotal: ${getUserPoints(guildId, channelId, userId)} points.`,
            ephemeral: true,
        });

        const displayName = interaction.member.displayName;
        await thread.send(`${displayName} earned ${userPoints.toFixed(1)} points for themselves.\n${channelPointsMessage}`);
    },
};

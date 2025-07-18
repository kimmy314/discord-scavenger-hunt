const { SlashCommandBuilder } = require('discord.js');
const { createHunt } = require('../../services/huntService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createhunt')
        .setDescription('Start a scavenger hunt in this channel')
        .addStringOption(option => option.setName('sheet').setDescription('Google Sheet URL').setRequired(true))
        .addIntegerOption(option => option.setName('hints').setDescription('Hints per set').setRequired(true))
        .addIntegerOption(option => option.setName('seconds').setDescription('Seconds between hints').setRequired(true))
        .addIntegerOption(option => option.setName('goal').setDescription('Server goal').setRequired(true)),
    async execute(interaction) {
        const channelId = interaction.channel.id;
        const sheetUrl = interaction.options.getString('sheet');
        const hints = interaction.options.getInteger('hints');
        const seconds = interaction.options.getInteger('seconds');
        const goal = interaction.options.getInteger('goal');

        createHunt(channelId, { sheetUrl, hints, seconds, goal });
        await interaction.reply('Hunt created for this channel!');
    },
};

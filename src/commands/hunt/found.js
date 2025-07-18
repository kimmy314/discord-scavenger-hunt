const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('found').setDescription('Submit a find'),
    async execute(interaction) {
        await interaction.reply('Found (placeholder)');
    },
};

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('rank').setDescription('Show rankings'),
    async execute(interaction) {
        await interaction.reply('Rank (placeholder)');
    },
};

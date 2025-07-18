const { SlashCommandBuilder } = require('discord.js');
const { getPublicSheetData, extractSpreadsheetIdFromUrl } = require('../../services/googleSheetsService');
const { saveHuntConfig } = require('../../utils/huntData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createHunt')
        .setDescription('Create a new scavenger hunt')
        .addStringOption(option =>
            option.setName('sheetUrl')
                .setDescription('Google Sheet URL')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('hints')
                .setDescription('Number of hints')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Seconds between hints')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('goal')
                .setDescription('Server points goal')
                .setRequired(true)),

    async execute(interaction) {
        if (interaction.user.username !== 'Kim') {
            return interaction.reply({ content: 'Only Kim can run this command.', ephemeral: true });
        }

        const sheetUrl = interaction.options.getString('sheetUrl');
        const hints = interaction.options.getInteger('hints');
        const seconds = interaction.options.getInteger('seconds');
        const goal = interaction.options.getInteger('goal');

        try {
            const spreadsheetId = extractSpreadsheetIdFromUrl(sheetUrl);
            const sheetData = await getPublicSheetData(spreadsheetId);

            const huntConfig = {
                sheetUrl,
                hints,
                seconds,
                goal,
                sheetData,
                createdAt: Date.now(),
            };

            await saveHuntConfig(interaction.guild.id, huntConfig);

            await interaction.reply(`Hunt created. Hints every ${seconds} seconds. Server goal: ${goal} points.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to create hunt. Please check the sheet URL.', ephemeral: true });
        }
    },
};

const { SlashCommandBuilder } = require('discord.js');
const { getPublicSheetData, extractSpreadsheetIdFromUrl } = require('../../services/googleSheetsService');
const { createHunt, saveHuntThreads } = require('../../services/huntData');
const { scheduleHintsForThread } = require('../../services/scheduler');

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

            // Save hunt config per channel
            createHunt(interaction.channel.id, {
                sheetUrl,
                hints,
                seconds,
                goal,
                sheetData,
            });

            const guildHuntData = {
                threads: [],
            };

            for (const row of sheetData) {
                const week = row['Week #'];
                const gym = row['Gym'];
                const kayaId = row['Kaya Id'];
                const startDate = row['Start Date'];

                const threadName = `Set: ${week} - ${gym}`;
                const thread = await interaction.channel.threads.create({
                    name: threadName,
                    autoArchiveDuration: 1440,
                    reason: 'Scavenger hunt thread',
                });

                await scheduleHintsForThread({
                    thread,
                    spreadsheetId,
                    week,
                    gym,
                    secondsBetweenHints: seconds,
                    totalHints: hints,
                    getSheetData: (id) => getPublicSheetData(id),
                });

                guildHuntData.threads.push({
                    threadId: thread.id,
                    week,
                    gym,
                    kayaId,
                    startDate,
                });
            }

            await saveHuntThreads(interaction.guild.id, guildHuntData);

            await interaction.reply(`Hunt created. Threads created. Hints every ${seconds} seconds. Server goal: ${goal} points.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to create hunt. Please check the sheet URL.', ephemeral: true });
        }
    },
};

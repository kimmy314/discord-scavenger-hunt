const { SlashCommandBuilder } = require('discord.js');
const { getPublicSheetData, extractSpreadsheetIdFromUrl } = require('../../services/googleSheetsService');
const { createHunt, saveHuntThreads, loadHuntThreads, getHunt } = require('../../services/huntData');
const { scheduleHintsForThread } = require('../../services/scheduler');
const { DateTime } = require('luxon');

const ADMIN_USER_ID = '114440671066193929';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_hunt')
        .setDescription('Create a new scavenger hunt')
        .addStringOption(option =>
            option.setName('sheet_url')
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
                .setDescription('Channel points goal')
                .setRequired(true)),

    async execute(interaction) {
        if (interaction.user.id !== ADMIN_USER_ID) {
            return interaction.reply({ content: 'Only Kim can run this command.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const sheetUrl = interaction.options.getString('sheet_url');
        const hints = interaction.options.getInteger('hints');
        const seconds = interaction.options.getInteger('seconds');
        const goal = interaction.options.getInteger('goal');

        try {
            const spreadsheetId = extractSpreadsheetIdFromUrl(sheetUrl);
            const sheetData = await getPublicSheetData(spreadsheetId);

            createHunt(interaction.channel.id, {
                sheetUrl,
                hints,
                seconds,
                goal,
            });

            const existingThreads = await loadHuntThreads(interaction.guild.id);

            for (const row of sheetData) {
                const set = row['Set #'];
                const gym = row['Gym'];
                const kayaId = String(row['Kaya Id']).trim();
                const startDate = row['Start Date'];

                const startDateTime = DateTime.fromFormat(startDate.trim(), 'M/d/yyyy HH:mm:ss', { zone: 'America/Los_Angeles' });
                const firstHintTimestamp = Math.floor(startDateTime.toMillis() / 1000);

                const threadName = `Set: ${set} - ${gym}`;
                const thread = await interaction.channel.threads.create({
                    name: threadName,
                    autoArchiveDuration: 10080,
                    reason: 'Scavenger hunt thread',
                });

                await thread.send(`First hint will be released <t:${firstHintTimestamp}:t>`);

                await scheduleHintsForThread({
                    thread,
                    spreadsheetId,
                    set,
                    gym,
                    secondsBetweenHints: seconds,
                    totalHints: hints,
                    getSheetData: (id) => getPublicSheetData(id),
                });

                existingThreads.threads.push({
                    threadId: thread.id,
                    channelId: interaction.channel.id,
                    set,
                    gym,
                    kayaId,
                    startDate,
                    hintsGiven: 0,
                });
            }

            await saveHuntThreads(interaction.guild.id, existingThreads);

            await interaction.editReply(`Hunt created. Threads created. Hints every ${seconds} seconds. Channel goal: ${goal} points.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Failed to create hunt. Please check the sheet URL.' });
        }
    },
};

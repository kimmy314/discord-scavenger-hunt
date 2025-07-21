const { SlashCommandBuilder } = require('discord.js');
const { getHunt, loadHuntThreads } = require('../../services/huntData');
const { getChannelPoints } = require('../../services/pointsService');

const ADMIN_USER_ID = '114440671066193929';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Show current hunt status for this channel'),

    async execute(interaction) {
        if (interaction.user.id !== ADMIN_USER_ID) {
            return interaction.reply({ content: 'Only Kim can run this command.', ephemeral: true });
        }

        const channelId = interaction.channel.id;
        const guildId = interaction.guild.id;

        const huntConfig = getHunt(channelId);
        const threadsFile = await loadHuntThreads(guildId);
        const channelPoints = getChannelPoints(guildId, channelId);

        if (!huntConfig) {
            return interaction.reply('No active hunt for this channel.');
        }

        const setsInfo = threadsFile.threads.map(thread => {
            return `Set ${thread.set} - Gym ${thread.gym}: Hints Given: ${thread.hintsGiven || 0}`;
        });

        await interaction.reply({
            content:
                `📋 **Hunt Status for this Channel** 📋\n\n` +
                `Channel Goal: ${huntConfig.goal} points\n` +
                `Current Channel Points: ${channelPoints}\n` +
                `\n${setsInfo.join('\n')}`,
            ephemeral: true,
        });
    },
};

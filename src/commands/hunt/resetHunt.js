const { SlashCommandBuilder } = require('discord.js');
const { resetHunt, saveHuntThreads, loadHuntThreads } = require('../../services/huntData');
const fs = require('fs');
const path = require('path');

const ADMIN_USER_ID = '114440671066193929';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset_hunt')
        .setDescription('Reset hunt for this channel (admin only)'),

    async execute(interaction) {
        if (interaction.user.id !== ADMIN_USER_ID) {
            return interaction.reply({ content: 'Only Kim can run this command.', ephemeral: true });
        }

        const channelId = interaction.channel.id;
        const guildId = interaction.guild.id;

        // Remove hunt config for this channel
        resetHunt(channelId);

        // Remove threads and submissions related to this channel
        const threadsPath = path.join(__dirname, '../../data', `${guildId}-threads.json`);
        let data = { threads: [], submissions: {}, channelPointsAwardedForSet: {} };

        if (fs.existsSync(threadsPath)) {
            data = JSON.parse(fs.readFileSync(threadsPath));

            if (data.threads) {
                data.threads = data.threads.filter(t => t.channelId !== channelId);
            }

            if (data.submissions) {
                delete data.submissions[channelId];
            }

            if (data.channelPointsAwardedForSet) {
                delete data.channelPointsAwardedForSet[channelId];
            }
        }

        await saveHuntThreads(guildId, data);

        await interaction.reply({
            content: 'Hunt data for this channel has been reset.',
            ephemeral: true,
        });
    },
};

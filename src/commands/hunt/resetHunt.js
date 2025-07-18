const { SlashCommandBuilder } = require('discord.js');
const { resetHunt, saveHuntThreads } = require('../../services/huntData');
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

        resetHunt(channelId);

        const threadsPath = path.join(__dirname, '../../data', `${guildId}-threads.json`);
        if (fs.existsSync(threadsPath)) {
            fs.unlinkSync(threadsPath);
        }

        await interaction.reply({
            content: 'Hunt data for this channel has been reset.',
            ephemeral: true,
        });
    },
};

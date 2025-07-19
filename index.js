const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const { loadHuntThreads, getHunt } = require('./src/services/huntData');
const { getPublicSheetData, extractSpreadsheetIdFromUrl } = require('./src/services/googleSheetsService');
const { scheduleHintsForThread } = require('./src/services/scheduler');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        client.commands.set(command.data.name, command);
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const hunts = require('./data/hunts.json');

    for (const [channelId, huntConfig] of Object.entries(hunts)) {
        try {
            const channel = await client.channels.fetch(channelId);
            const spreadsheetId = extractSpreadsheetIdFromUrl(huntConfig.sheetUrl);
            const sheetData = await getPublicSheetData(spreadsheetId);
            const threadsFile = await loadHuntThreads(channel.guild.id);

            for (const threadData of threadsFile.threads) {
                const thread = await channel.threads.fetch(threadData.threadId);
                await scheduleHintsForThread({
                    thread,
                    spreadsheetId,
                    set: threadData.set,
                    gym: threadData.gym,
                    secondsBetweenHints: huntConfig.seconds,
                    totalHints: huntConfig.hints,
                    getSheetData: (id) => getPublicSheetData(id),
                });
            }
        } catch (error) {
            console.error(`Failed to reschedule hints for channel ${channelId}:`, error);
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'Error executing command.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Error executing command.', ephemeral: true });
            }
        } catch (replyError) {
            console.error('Failed to reply to interaction:', replyError);
        }
    }
});

client.login(config.token);

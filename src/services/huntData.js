const fs = require('fs');
const path = require('path');

function getConfigFilePath(guildId) {
    return path.join(__dirname, '../../data', `${guildId}-config.json`);
}

function getThreadsFilePath(guildId) {
    return path.join(__dirname, '../../data', `${guildId}-threads.json`);
}

async function saveHuntConfig(guildId, config) {
    const filePath = getConfigFilePath(guildId);
    fs.writeFileSync(filePath, JSON.stringify(config, null, 4));
}

async function loadHuntConfig(guildId) {
    const filePath = getConfigFilePath(guildId);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

async function saveHuntThreads(guildId, threadsData) {
    const filePath = getThreadsFilePath(guildId);
    fs.writeFileSync(filePath, JSON.stringify(threadsData, null, 4));
}

async function loadHuntThreads(guildId) {
    const filePath = getThreadsFilePath(guildId);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

module.exports = {
    saveHuntConfig,
    loadHuntConfig,
    saveHuntThreads,
    loadHuntThreads,
};

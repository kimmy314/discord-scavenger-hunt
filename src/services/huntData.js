const fs = require('fs');
const path = require('path');

function getThreadsFilePath(guildId) {
    return path.join(__dirname, '../../data', `${guildId}-threads.json`);
}

function getHuntFilePath() {
    return path.join(__dirname, '../../data', 'hunts.json');
}

function loadHunts() {
    const filePath = getHuntFilePath();
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
}

function saveHunts(state) {
    const filePath = getHuntFilePath();
    fs.writeFileSync(filePath, JSON.stringify(state, null, 4));
}

const hunts = loadHunts();

function createHunt(channelId, huntConfig) {
    hunts[channelId] = { ...huntConfig, createdAt: new Date().toISOString() };
    saveHunts(hunts);
}

function getHunt(channelId) {
    return hunts[channelId];
}

function resetHunt(channelId) {
    delete hunts[channelId];
    saveHunts(hunts);
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
    saveHuntThreads,
    loadHuntThreads,
    createHunt,
    getHunt,
    resetHunt,
};

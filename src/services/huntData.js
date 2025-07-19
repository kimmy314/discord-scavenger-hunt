const fs = require('fs');
const path = require('path');

function getThreadsFilePath(guildId) {
    return path.join(__dirname, '../../data', `${guildId}-threads.json`);
}

function getHuntFilePath() {
    return path.join(__dirname, '../../data', 'hunts.json');
}

function ensureHuntFileExists() {
    const filePath = getHuntFilePath();
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
    }
}

function loadHunts() {
    ensureHuntFileExists();
    const filePath = getHuntFilePath();
    return JSON.parse(fs.readFileSync(filePath));
}

function saveHunts(state) {
    const filePath = getHuntFilePath();
    fs.writeFileSync(filePath, JSON.stringify(state, null, 4));
}

ensureHuntFileExists();
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
    if (!fs.existsSync(filePath)) {
        return { threads: [], submissions: {}, serverPointsAwardedForSet: [] };
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);

    if (!parsed.submissions) parsed.submissions = {};
    if (!parsed.serverPointsAwardedForSet) parsed.serverPointsAwardedForSet = [];

    return parsed;
}

module.exports = {
    saveHuntThreads,
    loadHuntThreads,
    createHunt,
    getHunt,
    resetHunt,
};

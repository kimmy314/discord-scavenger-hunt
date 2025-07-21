const fs = require('fs');
const path = require('path');

function getPointsFilePath() {
    return path.join(__dirname, '../../data', 'points.json');
}

function getChannelFilePath() {
    return path.join(__dirname, '../../data', 'channel.json');
}

function loadPoints() {
    const filePath = getPointsFilePath();
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
}

function savePoints(points) {
    const filePath = getPointsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(points, null, 4));
}

function loadChannelScores() {
    const filePath = getChannelFilePath();
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
}

function saveChannelScores(channels) {
    const filePath = getChannelFilePath();
    fs.writeFileSync(filePath, JSON.stringify(channels, null, 4));
}

const pointsData = loadPoints();
const channelData = loadChannelScores();

function addUserPoints(guildId, userId, pointsToAdd) {
    if (!pointsData[guildId]) pointsData[guildId] = {};
    if (!pointsData[guildId][userId]) pointsData[guildId][userId] = 0;

    pointsData[guildId][userId] += pointsToAdd;
    savePoints(pointsData);
}

function getUserPoints(guildId, userId) {
    return pointsData[guildId]?.[userId] || 0;
}

function addChannelPoints(guildId, channelId, pointsToAdd) {
    const key = `${guildId}-${channelId}`;
    if (!channelData[key]) channelData[key] = { score: 0 };

    channelData[key].score += pointsToAdd;
    saveChannelScores(channelData);
}

function getChannelPoints(guildId, channelId) {
    const key = `${guildId}-${channelId}`;
    return channelData[key]?.score || 0;
}

function getAllUserPoints(guildId) {
    return pointsData[guildId] || {};
}

module.exports = {
    addUserPoints,
    getUserPoints,
    addChannelPoints,
    getChannelPoints,
    getAllUserPoints,
};

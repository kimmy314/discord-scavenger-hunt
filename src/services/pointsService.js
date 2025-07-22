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

function addUserPoints(guildId, channelId, userId, pointsToAdd) {
    if (!pointsData[guildId]) pointsData[guildId] = {};
    if (!pointsData[guildId][channelId]) pointsData[guildId][channelId] = {};
    if (!pointsData[guildId][channelId][userId]) pointsData[guildId][channelId][userId] = 0;

    pointsData[guildId][channelId][userId] += pointsToAdd;
    savePoints(pointsData);
}

function getUserPoints(guildId, channelId, userId) {
    return pointsData[guildId]?.[channelId]?.[userId] || 0;
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

function getAllUserPoints(guildId, channelId) {
    return pointsData[guildId]?.[channelId] || {};
}

module.exports = {
    addUserPoints,
    getUserPoints,
    addChannelPoints,
    getChannelPoints,
    getAllUserPoints,
};

const fs = require('fs');
const path = require('path');

function getPointsFilePath() {
    return path.join(__dirname, '../../data', 'points.json');
}

function getServerFilePath() {
    return path.join(__dirname, '../../data', 'server.json');
}

function loadPoints() {
    const filePath = getPointsFilePath();
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
}

function savePoints(points) {
    const filePath = getPointsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(points, null, 4));
}

function loadServerScores() {
    const filePath = getServerFilePath();
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
}

function saveServerScores(servers) {
    const filePath = getServerFilePath();
    fs.writeFileSync(filePath, JSON.stringify(servers, null, 4));
}

const pointsData = loadPoints();
const serverData = loadServerScores();

function addUserPoints(guildId, userId, pointsToAdd) {
    if (!pointsData[guildId]) pointsData[guildId] = {};
    if (!pointsData[guildId][userId]) pointsData[guildId][userId] = 0;

    pointsData[guildId][userId] += pointsToAdd;
    savePoints(pointsData);
}

function getUserPoints(guildId, userId) {
    return pointsData[guildId]?.[userId] || 0;
}

function addServerPoints(guildId, channelId, pointsToAdd) {
    const key = `${guildId}-${channelId}`;
    if (!serverData[key]) serverData[key] = { score: 0 };

    serverData[key].score += pointsToAdd;
    saveServerScores(serverData);
}

function getServerPoints(guildId, channelId) {
    const key = `${guildId}-${channelId}`;
    return serverData[key]?.score || 0;
}

function getAllUserPoints(guildId) {
    return pointsData[guildId] || {};
}

module.exports = {
    addUserPoints,
    getUserPoints,
    addServerPoints,
    getServerPoints,
    getAllUserPoints,
};

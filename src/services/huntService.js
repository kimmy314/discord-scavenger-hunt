const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/channelHunts.json');
function loadState() { return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {}; }
function saveState(state) { fs.writeFileSync(filePath, JSON.stringify(state, null, 4)); }

let activeHunts = loadState();

function createHunt(channelId, { sheetUrl, hints, seconds, goal }) {
    activeHunts[channelId] = { sheetUrl, hints, seconds, goal, createdAt: new Date().toISOString() };
    saveState(activeHunts);
}
function getHunt(channelId) { return activeHunts[channelId]; }
function resetHunt(channelId) { delete activeHunts[channelId]; saveState(activeHunts); }

module.exports = { createHunt, getHunt, resetHunt };

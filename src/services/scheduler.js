const { DateTime } = require('luxon');
const { loadHuntThreads, saveHuntThreads } = require('./huntData');

async function scheduleHintsForThread({
    thread,
    spreadsheetId,
    set,
    gym,
    secondsBetweenHints,
    totalHints,
    getSheetData,
}) {
    const sheetData = await getSheetData(spreadsheetId);
    const row = sheetData.find(r => r['Set #'] === set && r['Gym'] === gym);
    if (!row) return;

    const rawStartDate = (row['Start Date'] || '').trim();

    const startDateTime = DateTime.fromFormat(rawStartDate, 'M/d/yyyy HH:mm:ss', { zone: 'America/Los_Angeles' });
    if (!startDateTime.isValid) {
        console.error(`❗ Invalid Start Date format for Set ${set}, Gym ${gym}: "${rawStartDate}"`);
        return;
    }

    const startTime = startDateTime.toMillis();

    console.log('Parsed start time (San Francisco time):', new Date(startTime).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

    const guildId = thread.guild.id;
    const threadsFile = await loadHuntThreads(guildId);
    const targetThread = threadsFile.threads.find(t => t.set == set && t.gym == gym);
    const alreadyGiven = targetThread?.hintsGiven || 0;

    for (let i = alreadyGiven; i < totalHints; i++) {
        const scheduledTime = startTime + i * secondsBetweenHints * 1000;
        const delay = scheduledTime - Date.now();

        const sendHint = async () => {
            const latestSheet = await getSheetData(spreadsheetId);
            const latestRow = latestSheet.find(r => r['Set #'] === set && r['Gym'] === gym);
            if (!latestRow) return;

            const hintUrl = latestRow[`Hint ${i + 1}`];
            if (hintUrl) {
                await thread.send(`Hint ${i + 1}: ${hintUrl}`);

                if (targetThread) {
                    targetThread.hintsGiven = (targetThread.hintsGiven || 0) + 1;
                    await saveHuntThreads(guildId, threadsFile);
                }
            }

            if (i + 1 < totalHints) {
                const nextHintTimestamp = Math.floor((scheduledTime + secondsBetweenHints * 1000) / 1000);
                await thread.send(`Next hint will be released <t:${nextHintTimestamp}:t>`);
            }
        };

        if (delay <= 0) {
            console.log(`Hint ${i + 1} for Set ${set}, Gym ${gym} is overdue. Sending now.`);
            await sendHint();
        } else {
            setTimeout(sendHint, delay);
        }
    }
}

module.exports = {
    scheduleHintsForThread,
};

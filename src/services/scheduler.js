const { DateTime } = require('luxon');

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

    for (let i = 0; i < totalHints; i++) {
        const scheduledTime = startTime + i * secondsBetweenHints * 1000;
        const delay = scheduledTime - Date.now();

        const sendHint = async () => {
            const latestSheet = await getSheetData(spreadsheetId);
            const latestRow = latestSheet.find(r => r['Set #'] === set && r['Gym'] === gym);
            if (!latestRow) return;

            const hintUrl = latestRow[`Hint ${i + 1}`];
            if (hintUrl) {
                await thread.send(`Hint ${i + 1}: ${hintUrl}`);
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

async function scheduleHintsForThread({
    thread,
    spreadsheetId,
    week,
    gym,
    secondsBetweenHints,
    totalHints,
    getSheetData,
}) {
    const timeouts = [];
    const sheetData = await getSheetData(spreadsheetId);
    const row = sheetData.find(r => r['Week #'] === week && r['Gym'] === gym);
    if (!row) return;

    const startTime = new Date(row['Start Date']).getTime();

    for (let i = 0; i < totalHints; i++) {
        const delay = startTime + i * secondsBetweenHints * 1000 - Date.now();
        if (delay < 0) continue;

        const timeout = setTimeout(async () => {
            const latestSheet = await getSheetData(spreadsheetId);
            const latestRow = latestSheet.find(r => r['Week #'] === week && r['Gym'] === gym);
            if (!latestRow) return;

            const hintUrl = latestRow[`Hint ${i + 1}`];
            if (hintUrl) {
                thread.send(`Hint ${i + 1}: ${hintUrl}`);
            }
        }, delay);

        timeouts.push(timeout);
    }
    return timeouts;
}

module.exports = {
    scheduleHintsForThread,
};

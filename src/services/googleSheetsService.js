const { parse } = require('csv-parse/sync');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function extractSpreadsheetIdFromUrl(url) {
    try {
        return url.split('/d/')[1].split('/')[0];
    } catch (error) {
        throw new Error('Invalid Google Sheet URL format.');
    }
}

async function getPublicSheetData(spreadsheetId) {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
    const response = await fetch(url);
    const csv = await response.text();

    const records = parse(csv, {
        columns: true,
        skip_empty_lines: true,
    });

    return records;
}

module.exports = {
    getPublicSheetData,
    extractSpreadsheetIdFromUrl,
};

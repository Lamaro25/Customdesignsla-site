const { google } = require('googleapis');

const STATUS_VALUES = [
  'New', 'Reviewing', 'Designing', 'Preview Sent', 'Approved', 'Invoice Sent', 'Paid',
  'Printing', 'Casting', 'Finishing', 'Ready', 'Shipped', 'Delivered', 'Cancelled'
];

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase();
}

function findColumnIndex(headers, candidates) {
  const normalized = headers.map(normalizeHeader);
  for (const candidate of candidates) {
    const idx = normalized.indexOf(normalizeHeader(candidate));
    if (idx >= 0) return idx;
  }
  return -1;
}

function columnToA1(index) {
  let n = index + 1;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function getAuth() {
  return new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    String(process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );
}

async function getSheetValues(range = 'Sheet1!A:Z') {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return { sheets, spreadsheetId, values: response.data.values || [] };
}

module.exports = {
  STATUS_VALUES,
  findColumnIndex,
  columnToA1,
  getSheetValues
};

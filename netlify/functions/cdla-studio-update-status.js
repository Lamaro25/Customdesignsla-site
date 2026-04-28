const { verifySession } = require('./_cdlaStudioAuth');
const { STATUS_VALUES, findColumnIndex, columnToA1, getSheetValues } = require('./_cdlaStudioSheets');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  try {
    if (!verifySession(event)) return json(401, { error: 'Unauthorized' });
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

    const data = JSON.parse(event.body || '{}');
    const rowNumber = Number(data.rowNumber);
    const nextStatus = String(data.status || '').trim();
    const adminNotes = String(data.adminNotes || '').trim();

    if (!Number.isInteger(rowNumber) || rowNumber < 2) {
      return json(400, { error: 'A valid rowNumber is required.' });
    }
    if (!STATUS_VALUES.includes(nextStatus)) {
      return json(400, { error: 'Invalid status value.' });
    }

    const { sheets, spreadsheetId, values } = await getSheetValues('Sheet1!1:1');
    const headers = values[0] || [];
    let statusCol = findColumnIndex(headers, ['Status']);
    if (statusCol < 0) statusCol = 1;

    const notesCol = findColumnIndex(headers, ['Admin Notes', 'Internal Admin Notes']);

    const updates = [{
      range: `Sheet1!${columnToA1(statusCol)}${rowNumber}`,
      values: [[nextStatus]]
    }];

    if (notesCol >= 0) {
      updates.push({
        range: `Sheet1!${columnToA1(notesCol)}${rowNumber}`,
        values: [[adminNotes]]
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      }
    });

    return json(200, { success: true });
  } catch (error) {
    return json(500, { error: error.message || 'Unable to update status.' });
  }
};

const { google } = require('googleapis');

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body || '{}');
    console.log("Incoming data:", data);

    const row = [
      new Date().toISOString(),
      'NEW',
      data.customerName || '',
      data.customerEmail || '',
      data.customerPhone || '',
      data.productName || '',
      data.sku || '',
      data.ringSize || '',
      data.insideText || '',
      data.outsideText || '',
      data.symbols || '',
      data.summary || '',
      data.notes || ''
    ];

    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:M',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

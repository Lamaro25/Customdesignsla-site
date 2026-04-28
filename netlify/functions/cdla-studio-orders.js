const { verifySession } = require('./_cdlaStudioAuth');
const { STATUS_VALUES, findColumnIndex, getSheetValues } = require('./_cdlaStudioSheets');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

function parseMoney(value) {
  const n = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

exports.handler = async (event) => {
  try {
    if (!verifySession(event)) return json(401, { error: 'Unauthorized' });

    const { values } = await getSheetValues('Sheet1!A:Z');
    if (!values.length) return json(200, { orders: [], summary: {} });

    const headers = values[0];
    const rows = values.slice(1);

    const idx = {
      submittedAt: findColumnIndex(headers, ['Date/time submitted', 'Timestamp', 'Submitted At', 'Date']),
      status: findColumnIndex(headers, ['Status']),
      customerName: findColumnIndex(headers, ['Customer name', 'Name']),
      email: findColumnIndex(headers, ['Email', 'Customer email']),
      phone: findColumnIndex(headers, ['Phone', 'Customer phone']),
      address: findColumnIndex(headers, ['Mailing/shipping address', 'Address', 'Shipping Address']),
      product: findColumnIndex(headers, ['Product name', 'Product']),
      sku: findColumnIndex(headers, ['SKU']),
      ringSize: findColumnIndex(headers, ['Ring size / selected size', 'Ring Size', 'Selected Size']),
      insideText: findColumnIndex(headers, ['Inside text', 'Inside Text']),
      outsideText: findColumnIndex(headers, ['Outside text', 'Outside Text']),
      symbols: findColumnIndex(headers, ['Symbols', 'Selected Symbols']),
      notes: findColumnIndex(headers, ['Customer notes', 'Customer Notes', 'Customer notes (optional)', 'Customer Note']),
      estimatedTotal: findColumnIndex(headers, ['Estimated total', 'Estimated Total', 'Estimated Price', 'Total Estimate']),
      imageUrl: findColumnIndex(headers, ['Uploaded Image URL', 'Uploaded image URL', 'Uploaded Image', 'Image URL', 'Custom Image URL', 'uploadedImageUrl', 'imageUrl']),
      imageFilename: findColumnIndex(headers, ['Uploaded Image Filename', 'Uploaded image filename', 'Uploaded Image Name']),
      adminNotes: findColumnIndex(headers, ['Admin Notes', 'Internal Admin Notes'])
    };

    if (idx.status < 0) idx.status = 1;

    const orders = rows
      .map((row, i) => {
        const sheetRowNumber = i + 2;
        const statusRaw = String(row[idx.status] || 'New').trim();
        const status = STATUS_VALUES.includes(statusRaw) ? statusRaw : statusRaw || 'New';
        return {
          id: sheetRowNumber,
          submittedAt: row[idx.submittedAt] || '',
          status,
          customerName: row[idx.customerName] || '',
          email: row[idx.email] || '',
          phone: row[idx.phone] || '',
          address: row[idx.address] || '',
          productName: row[idx.product] || '',
          sku: row[idx.sku] || '',
          ringSize: row[idx.ringSize] || '',
          insideText: row[idx.insideText] || '',
          outsideText: row[idx.outsideText] || '',
          symbols: row[idx.symbols] || '',
          customerNotes: row[idx.notes] || '',
          estimatedTotal: row[idx.estimatedTotal] || '',
          uploadedImageUrl: row[idx.imageUrl] || '',
          uploadedImageFilename: row[idx.imageFilename] || '',
          adminNotes: row[idx.adminNotes] || ''
        };
      })
      .sort((a, b) => (new Date(b.submittedAt).getTime() || 0) - (new Date(a.submittedAt).getTime() || 0));

    const pendingStatuses = new Set(['New', 'Reviewing']);
    const inProgressStatuses = new Set(['Designing', 'Invoice Sent', 'Printing', 'Casting', 'Finishing']);
    const summary = {
      totalOrders: orders.length,
      newPending: orders.filter((o) => pendingStatuses.has(o.status)).length,
      inProgress: orders.filter((o) => inProgressStatuses.has(o.status)).length,
      previewSent: orders.filter((o) => o.status === 'Preview Sent').length,
      paidReady: orders.filter((o) => o.status === 'Paid' || o.status === 'Ready').length,
      estimatedRevenue: orders.reduce((sum, o) => sum + parseMoney(o.estimatedTotal), 0)
    };

    return json(200, { orders, summary, statuses: STATUS_VALUES });
  } catch (error) {
    return json(500, { error: error.message || 'Unable to load orders' });
  }
};

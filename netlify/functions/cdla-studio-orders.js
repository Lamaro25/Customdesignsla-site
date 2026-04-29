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
  const cleaned = String(value || '').replace(/[$,\s]/g, '');
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function normalizeHeaderKey(value) {
  return String(value || '').toLowerCase().replace(/[\s_]+/g, '');
}

function pickField(rowByHeader, candidates) {
  for (const candidate of candidates) {
    const key = normalizeHeaderKey(candidate);
    const value = rowByHeader[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

const TOTAL_HEADER_CANDIDATES = [
  'Estimated Total',
  'Final Total',
  'Total Price',
  'Total',
  'estimatedTotal',
  'finalTotal'
];

const NOTES_HEADER_CANDIDATES = [
  'Customer Notes',
  'Customer Note',
  'Notes',
  'Order Notes',
  'Customer Request',
  'Custom Requests',
  'Special Requests',
  'customerNotes',
  'orderNotes',
  'notes'
];


function isCurrencyOnly(value) {
  return /^\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/.test(String(value || '').trim());
}

function isValidUrl(value) {
  try {
    const parsed = new URL(String(value || ''));
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_error) {
    return false;
  }
}

exports.handler = async (event) => {
  try {
    if (!verifySession(event)) return json(401, { error: 'Unauthorized' });

    const { values } = await getSheetValues('Sheet1!A:Z');
    if (!values.length) return json(200, { orders: [], summary: {} });

    const headers = values[0];
    const rows = values.slice(1);

    const normalizedHeaders = headers.map((header) => normalizeHeaderKey(header));

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
      notes: findColumnIndex(headers, [
        ...NOTES_HEADER_CANDIDATES
      ]),
      estimatedTotal: findColumnIndex(headers, TOTAL_HEADER_CANDIDATES),
      imageUrl: findColumnIndex(headers, [
        'Uploaded Image URL',
        'Uploaded Image Url',
        'Image URL',
        'Image Url',
        'Custom Image URL',
        'Custom Symbol Image URL',
        'Uploaded Image',
        'uploadedImageUrl',
        'imageUrl',
        'customImageUrl',
        'Uploaded image URL'
      ]),
      imageFilename: findColumnIndex(headers, ['Uploaded Image Filename', 'Uploaded image filename', 'Uploaded Image Name']),
      adminNotes: findColumnIndex(headers, ['Admin Notes', 'Internal Admin Notes'])
    };

    const mappingCandidates = {
      estimatedTotal: TOTAL_HEADER_CANDIDATES.map(normalizeHeaderKey),
      customerNotes: NOTES_HEADER_CANDIDATES.map(normalizeHeaderKey),
      uploadedImageUrl: ['uploadedimageurl', 'imageurl', 'customimageurl'],
      customization: ['insidetext', 'outsidetext', 'symbols']
    };

    const mappedFields = Object.fromEntries(
      Object.entries(mappingCandidates).map(([fieldName, keys]) => {
        const detected = keys.find((key) => normalizedHeaders.includes(normalizeHeaderKey(key))) || '(not found)';
        return [fieldName, detected];
      })
    );
    console.log('[CDLA Studio] Detected normalized headers:', normalizedHeaders);
    console.log('[CDLA Studio] Field mapping:', mappedFields);
    console.log('[CDLA Studio] Header row:', headers);
    console.log('[CDLA Studio] Customer Notes column:', idx.notes >= 0 ? headers[idx.notes] : '(not found)');
    console.log('[CDLA Studio] Estimated Total column:', idx.estimatedTotal >= 0 ? headers[idx.estimatedTotal] : '(not found)');

    if (idx.status < 0) idx.status = 1;

    const orders = rows
      .map((row, i) => {
        const sheetRowNumber = i + 2;
        const rowByHeader = {};
        normalizedHeaders.forEach((headerKey, colIndex) => {
          if (!headerKey) return;
          rowByHeader[headerKey] = row[colIndex] || '';
        });

        let estimatedTotal = pickField(rowByHeader, mappingCandidates.estimatedTotal);
        let customerNotes = pickField(rowByHeader, mappingCandidates.customerNotes);

        const rawEstimatedTotal = idx.estimatedTotal >= 0 ? String(row[idx.estimatedTotal] || '').trim() : '';
        const rawCustomerNotes = idx.notes >= 0 ? String(row[idx.notes] || '').trim() : '';

        // Dashboard display repair for older bad rows:
        // if total is blank and notes contains only a currency value, show it as total and blank notes.
        if (!estimatedTotal && isCurrencyOnly(customerNotes)) {
          estimatedTotal = customerNotes;
          customerNotes = '';
        }

        // Never display currency-only values as customer notes.
        if (isCurrencyOnly(customerNotes)) {
          customerNotes = '';
        }

        const uploadedImageUrlRaw = pickField(rowByHeader, mappingCandidates.uploadedImageUrl);
        const uploadedImageUrl = isValidUrl(uploadedImageUrlRaw) ? uploadedImageUrlRaw : '';
        if (sheetRowNumber === 7) {
          console.log('[CDLA Studio] Order #7 raw values', {
            rawEstimatedTotal,
            rawCustomerNotes
          });
          console.log('[CDLA Studio] Order #7 normalized mapping', {
            estimatedTotal,
            customerNotes
          });
        }

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
          customerNotes: customerNotes || '—',
          estimatedTotal: estimatedTotal || '—',
          uploadedImageUrl,
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

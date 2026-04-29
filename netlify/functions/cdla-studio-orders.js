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
        'Customer Notes',
        'Customer Note',
        'Customer notes',
        'Notes',
        'Order Notes',
        'Customer Request',
        'Custom Requests',
        'Special Requests',
        'customerNotes',
        'orderNotes',
        'notes',
        'customer_notes',
        'Customer notes (optional)'
      ]),
      estimatedTotal: findColumnIndex(headers, [
        'Estimated Total',
        'Estimated total',
        'Final Total',
        'Final total',
        'Total',
        'Total Price',
        'estimatedTotal',
        'finalTotal',
        'Estimated Price',
        'Total Estimate'
      ]),
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
      estimatedTotal: ['estimatedtotal', 'finaltotal', 'totalprice'],
      customerNotes: [
        'customernotes',
        'customernote',
        'notes',
        'ordernotes',
        'customerrequest',
        'customrequests',
        'specialrequests'
      ],
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
    const notesHeaderIndex = idx.notes;
    const estimatedTotalHeaderIndex = idx.estimatedTotal;
    const olderGoodRow = rows.find((row) => {
      const notes = String(row[notesHeaderIndex] || '').trim();
      return notes && !isCurrencyOnly(notes);
    }) || [];
    const newerBadRow = [...rows].reverse().find((row) => {
      const notes = String(row[notesHeaderIndex] || '').trim();
      const total = String(row[estimatedTotalHeaderIndex] || '').trim();
      return isCurrencyOnly(notes) && !total;
    }) || [];
    console.log('[CDLA Studio] Header row:', headers);
    console.log('[CDLA Studio] Customer Notes column:', notesHeaderIndex >= 0 ? headers[notesHeaderIndex] : '(not found)');
    console.log('[CDLA Studio] Estimated Total column:', estimatedTotalHeaderIndex >= 0 ? headers[estimatedTotalHeaderIndex] : '(not found)');
    console.log('[CDLA Studio] Older good order row sample:', olderGoodRow);
    console.log('[CDLA Studio] Newer bad order row sample:', newerBadRow);

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
        const rawNotesValue = idx.notes >= 0 ? String(row[idx.notes] || '').trim() : '';
        if (!customerNotes && rawNotesValue) customerNotes = rawNotesValue;
        const uploadedImageUrlRaw = pickField(rowByHeader, mappingCandidates.uploadedImageUrl);
        const uploadedImageUrl = isValidUrl(uploadedImageUrlRaw) ? uploadedImageUrlRaw : '';
        if (i < 5 || sheetRowNumber === 7) {
          console.log('[CDLA Studio] Notes debug', {
            orderRow: sheetRowNumber,
            detectedNotesHeader: idx.notes >= 0 ? headers[idx.notes] : '(not found)',
            rawNotesValue,
            mappedCustomerNotes: customerNotes
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

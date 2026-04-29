const crypto = require('crypto');
const { google } = require('googleapis');

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const REQUIRED_CLOUDINARY_ENV_VARS = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

function getMissingCloudinaryEnvVars() {
  return REQUIRED_CLOUDINARY_ENV_VARS.filter((envVarName) => !String(process.env[envVarName] || '').trim());
}

function formatSubmittedAt() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const parts = formatter.formatToParts(new Date()).reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return `${parts.month}/${parts.day}/${parts.year} ${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
}

function sanitizeFileName(fileName) {
  return String(fileName || 'custom-symbol-upload')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 100);
}

function parseUploadedImageData(dataUrl) {
  if (!dataUrl) {
    return null;
  }

  const normalized = String(dataUrl || '').trim();
  const match = normalized.match(/^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=\s]+)$/);

  if (!match) {
    throw new Error('Uploaded image must be a JPG, PNG, or WEBP data URL.');
  }

  const mimeType = match[1];
  const base64Payload = match[2].replace(/\s+/g, '');
  const buffer = Buffer.from(base64Payload, 'base64');

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('Unsupported uploaded image type. Allowed: JPG, PNG, WEBP.');
  }

  if (!buffer.length) {
    throw new Error('Uploaded image payload is empty.');
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error('Uploaded image exceeds the 2MB limit.');
  }

  return {
    mimeType,
    buffer,
    base64Payload
  };
}

async function uploadImageToCloudinary(parsedUpload, originalFileName, requestedUploadPreset) {
  if (!parsedUpload) {
    return {
      uploadedImageUrl: '',
      uploadedImageFilename: ''
    };
  }

  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = String(process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || '').trim();
  // Netlify env vars for Cloudinary:
  // - Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  // - Optional: CLOUDINARY_FOLDER (preferred) or CLOUDINARY_UPLOAD_FOLDER (legacy fallback)
  const folder = String(process.env.CLOUDINARY_FOLDER || process.env.CLOUDINARY_UPLOAD_FOLDER || 'cdla-custom-orders').trim();
  const uploadPreset = 'CDLA_UPLOADS';
  const missingEnvVars = getMissingCloudinaryEnvVars();

  if (missingEnvVars.length) {
    const details = missingEnvVars.join(', ');
    const error = new Error(`Image upload requested but required Cloudinary env vars are missing: ${details}.`);
    error.code = 'MISSING_CLOUDINARY_ENV_VARS';
    error.missingEnvVars = missingEnvVars;
    throw error;
  }

  const safeOriginalFileName = sanitizeFileName(originalFileName);
  const extensionByMime = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };

  const mimeExtension = extensionByMime[parsedUpload.mimeType] || 'jpg';
  const fileBaseName = safeOriginalFileName.replace(/\.[^.]+$/, '') || 'custom-symbol-upload';
  const publicId = `${Date.now()}-${fileBaseName}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

  const formData = new FormData();
  formData.append('file', `data:${parsedUpload.mimeType};base64,${parsedUpload.base64Payload}`);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);
  formData.append('public_id', publicId);
  console.log('[Cloudinary Upload] Using upload preset:', uploadPreset);
  formData.append("upload_preset", "CDLA_UPLOADS");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Image upload failed. Please try again or submit without an image.');
  }

  return {
    uploadedImageUrl: String(payload.secure_url || ''),
    uploadedImageFilename: safeOriginalFileName || `${publicId}.${mimeExtension}`
  };
}

function buildEmailText(data, uploadedImageUrl) {
  return [
    `New CDLA Custom Order Request - ${data.productName || 'Custom Ring'}`,
    '',
    'Customer:',
    `Name: ${data.customerName || ''}`,
    `Email: ${data.customerEmail || ''}`,
    `Phone: ${data.customerPhone || ''}`,
    '',
    'Product:',
    `Product Name: ${data.productName || ''}`,
    `SKU: ${data.sku || ''}`,
    `Ring Size: ${data.ringSize || ''}`,
    `Estimated Total: ${data.estimatedTotal || ''}`,
    '',
    'Customization:',
    `Inside Text: ${data.insideText || ''}`,
    `Outside Text: ${data.outsideText || ''}`,
    `Selected Symbols: ${data.symbols || ''}`,
    `Customer Notes: ${data.notes || ''}`,
    '',
    'Uploaded Image:',
    uploadedImageUrl || 'No image uploaded.'
  ].join('\n');
}

async function sendNotificationEmail(data, uploadedImageUrl) {
  const recipient = String(
    process.env.CDLA_NOTIFICATION_EMAIL ||
      process.env.CUSTOM_ORDER_NOTIFICATION_EMAIL ||
      process.env.BUSINESS_NOTIFICATION_EMAIL ||
      ''
  ).trim();

  if (!recipient) {
    console.warn('Skipping notification email: recipient env var is not configured.');
    return false;
  }

  const subject = `New CDLA Custom Order Request - ${data.productName || 'Custom Ring'}`;
  const text = buildEmailText(data, uploadedImageUrl);

  const resendApiKey = String(process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.CUSTOM_ORDER_FROM_EMAIL || 'CDLA Orders <onboarding@resend.dev>',
        to: [recipient],
        subject,
        text
      })
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      throw new Error(`Resend email failed: ${errorPayload || response.status}`);
    }

    return true;
  }

  const sendgridApiKey = String(process.env.SENDGRID_API_KEY || '').trim();
  if (sendgridApiKey) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipient }] }],
        from: { email: process.env.CUSTOM_ORDER_FROM_EMAIL || 'no-reply@customdesignsla.com', name: 'CDLA Orders' },
        subject,
        content: [{ type: 'text/plain', value: text }]
      })
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      throw new Error(`SendGrid email failed: ${errorPayload || response.status}`);
    }

    return true;
  }

  console.warn('Skipping notification email: no email provider API key configured.');
  return false;
}


function normalizeHeaderKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findHeaderIndex(headers, candidates) {
  const normalized = headers.map((header) => normalizeHeaderKey(header));
  for (const candidate of candidates) {
    const index = normalized.indexOf(normalizeHeaderKey(candidate));
    if (index >= 0) return index;
  }
  return -1;
}

function buildRowFromHeaders(headers, data) {
  const row = new Array(headers.length).fill('');

  const fields = [
    { value: formatSubmittedAt(), headers: ['Date/time submitted', 'Timestamp', 'Submitted At', 'Date'] },
    { value: 'NEW', headers: ['Status'] },
    { value: data.customerName || '', headers: ['Customer name', 'Name'] },
    { value: data.customerEmail || '', headers: ['Email', 'Customer email'] },
    { value: data.customerPhone || '', headers: ['Phone', 'Customer phone'] },
    { value: data.productName || '', headers: ['Product name', 'Product'] },
    { value: data.sku || '', headers: ['SKU'] },
    { value: data.ringSize || '', headers: ['Ring size / selected size', 'Ring Size', 'Selected Size'] },
    { value: data.insideText || '', headers: ['Inside text', 'Inside Text'] },
    { value: data.outsideText || '', headers: ['Outside text', 'Outside Text'] },
    { value: data.symbols || '', headers: ['Symbols', 'Selected Symbols'] },
    { value: data.notes || '', headers: ['Customer Notes', 'Customer Note', 'Customer notes', 'Notes', 'Order Notes', 'Customer Request', 'Custom Requests', 'Special Requests', 'customerNotes', 'orderNotes', 'notes'] },
    { value: data.estimatedTotal || '', headers: ['Estimated Total', 'Final Total', 'Total Price', 'estimatedTotal', 'finalTotal'] },
    { value: data.uploadedImageUrl || '', headers: ['Uploaded Image URL', 'Image URL', 'uploadedImageUrl'] },
    { value: data.uploadedImageFilename || '', headers: ['Uploaded Image Filename', 'Uploaded Image Name', 'uploadedImageFilename'] }
  ];

  fields.forEach((field) => {
    const idx = findHeaderIndex(headers, field.headers);
    if (idx >= 0) row[idx] = field.value;
  });

  return row;
}

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body || '{}');

    const parsedUpload = parseUploadedImageData(data.uploadedImageDataUrl);
    const { uploadedImageUrl, uploadedImageFilename } = await uploadImageToCloudinary(
      parsedUpload,
      data.uploadedImageFilename,
      data.uploadPreset
    );

    data.uploadedImageUrl = uploadedImageUrl || '';
    data.uploadedImageFilename = uploadedImageFilename || '';

    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!1:1'
    });
    const headers = (headerResponse.data.values && headerResponse.data.values[0]) || [];
    const row = buildRowFromHeaders(headers, data);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:Z',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });

    let emailSent = false;
    try {
      emailSent = await sendNotificationEmail(data, uploadedImageUrl);
    } catch (emailError) {
      console.error('Custom order email failed:', emailError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        imageUploaded: Boolean(uploadedImageUrl),
        uploadedImageUrl,
        uploadedImageFilename,
        emailSent
      })
    };
  } catch (error) {
    const responseBody = { error: error.message };
    if (error.code === 'MISSING_CLOUDINARY_ENV_VARS') {
      responseBody.code = error.code;
      responseBody.missingEnvVars = Array.isArray(error.missingEnvVars) ? error.missingEnvVars : [];
    }

    return {
      statusCode: error.code === 'MISSING_CLOUDINARY_ENV_VARS' ? 422 : 500,
      body: JSON.stringify(responseBody)
    };
  }
};

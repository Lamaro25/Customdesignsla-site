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

async function uploadImageToCloudinary(parsedUpload, originalFileName) {
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
  const uploadPreset = String(process.env.CLOUDINARY_UPLOAD_PRESET || '').trim();
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
  if (uploadPreset) {
    formData.append('upload_preset', uploadPreset);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Unable to upload custom symbol image.');
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

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body || '{}');

    const parsedUpload = parseUploadedImageData(data.uploadedImageDataUrl);
    const { uploadedImageUrl, uploadedImageFilename } = await uploadImageToCloudinary(parsedUpload, data.uploadedImageFilename);

    const row = [
      formatSubmittedAt(),
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
      data.notes || '',
      data.estimatedTotal || '',
      uploadedImageUrl || '',
      uploadedImageFilename || ''
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
      range: 'Sheet1!A:O',
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

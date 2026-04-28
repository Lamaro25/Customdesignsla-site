const crypto = require('crypto');

const SESSION_COOKIE = 'cdla_studio_session';

function parseCookies(cookieHeader = '') {
  return String(cookieHeader || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const index = part.indexOf('=');
      if (index === -1) return acc;
      acc[decodeURIComponent(part.slice(0, index).trim())] = decodeURIComponent(part.slice(index + 1).trim());
      return acc;
    }, {});
}

function getSessionSecret() {
  const explicitSecret = String(process.env.CDLA_STUDIO_SESSION_SECRET || '').trim();
  if (explicitSecret) return explicitSecret;
  return `${String(process.env.CDLA_ADMIN_USERNAME || '')}:${String(process.env.CDLA_ADMIN_PASSWORD || '')}`;
}

function verifySession(event) {
  const secret = getSessionSecret();
  const cookies = parseCookies(event.headers?.cookie || event.headers?.Cookie || '');
  const token = cookies[SESSION_COOKIE];
  if (!token || !token.includes('.')) return null;

  const [encoded, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  if (!signature || signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  if (!payload || typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return null;
  return payload;
}

module.exports = { verifySession };

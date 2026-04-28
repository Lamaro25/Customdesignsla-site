const crypto = require('crypto');

const SESSION_COOKIE = 'cdla_studio_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function parseCookies(cookieHeader = '') {
  return String(cookieHeader || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const index = part.indexOf('=');
      if (index === -1) return acc;
      const key = decodeURIComponent(part.slice(0, index).trim());
      const value = decodeURIComponent(part.slice(index + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
}

function getSessionSecret() {
  const explicitSecret = String(process.env.CDLA_STUDIO_SESSION_SECRET || '').trim();
  if (explicitSecret) return explicitSecret;
  return `${String(process.env.CDLA_ADMIN_USERNAME || '')}:${String(process.env.CDLA_ADMIN_PASSWORD || '')}`;
}

function signPayload(payload, secret) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  if (!signature || signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  if (!payload || typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) {
    return null;
  }
  return payload;
}

function buildSessionCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  const adminUsername = String(process.env.CDLA_ADMIN_USERNAME || '').trim();
  const adminPassword = String(process.env.CDLA_ADMIN_PASSWORD || '').trim();
  const secret = getSessionSecret();

  if (!adminUsername || !adminPassword) {
    return json(500, { error: 'Admin credentials are not configured.' });
  }

  const method = String(event.httpMethod || 'GET').toUpperCase();
  const payload = event.body ? JSON.parse(event.body) : {};
  const action = String(payload.action || (method === 'GET' ? 'check' : '')).toLowerCase();
  const cookies = parseCookies(event.headers?.cookie || event.headers?.Cookie || '');
  const token = cookies[SESSION_COOKIE];
  const session = verifyToken(token, secret);

  if (action === 'check') {
    if (!session) return json(200, { authenticated: false });
    return json(200, { authenticated: true, username: session.username });
  }

  if (action === 'logout') {
    return json(200, { success: true }, { 'Set-Cookie': clearSessionCookie() });
  }

  if (action === 'login') {
    const username = String(payload.username || '').trim();
    const password = String(payload.password || '').trim();

    if (username !== adminUsername || password !== adminPassword) {
      return json(401, { error: 'Invalid username or password.' });
    }

    const now = Math.floor(Date.now() / 1000);
    const sessionToken = signPayload({ username, iat: now, exp: now + SESSION_TTL_SECONDS }, secret);
    return json(200, { success: true }, { 'Set-Cookie': buildSessionCookie(sessionToken) });
  }

  return json(405, { error: 'Unsupported action.' });
};

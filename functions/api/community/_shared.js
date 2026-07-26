export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  },
});

export const error = (message, status = 400, details = undefined) =>
  json({ ok: false, error: message, ...(details ? { details } : {}) }, status);

export const cleanText = (value, maxLength) => String(value ?? '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .trim()
  .slice(0, maxLength);

export const validTypes = new Set(['discussions', 'questions', 'ideas', 'stories']);
export const validCategories = new Set(['General', 'Firmware', 'Hardware', 'Home Assistant', 'RF / CC1101', 'Installation', 'Website']);

export const makeId = (prefix = 'p') => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;

export async function readJson(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error('JSON body required');
  return request.json();
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function clientKey(context) {
  const request = context.request;
  const supplied = cleanText(request.headers.get('x-openrf-client') || '', 120);
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const salt = context.env.RATE_LIMIT_SALT || 'openrf-community';
  return sha256Hex(`${salt}|${ip}|${supplied}`);
}

export async function enforceRateLimit(context, action, limit, windowSeconds) {
  const key = await clientKey(context);
  const cutoff = Math.floor(Date.now() / 1000) - windowSeconds;
  await context.env.COMMUNITY_DB.prepare('DELETE FROM rate_events WHERE created_at < ?').bind(cutoff - 86400).run();
  const countRow = await context.env.COMMUNITY_DB.prepare(
    'SELECT COUNT(*) AS total FROM rate_events WHERE client_key = ? AND action = ? AND created_at >= ?'
  ).bind(key, action, cutoff).first();
  if (Number(countRow?.total || 0) >= limit) {
    return { allowed: false, key };
  }
  await context.env.COMMUNITY_DB.prepare(
    'INSERT INTO rate_events (client_key, action, created_at) VALUES (?, ?, ?)'
  ).bind(key, action, Math.floor(Date.now() / 1000)).run();
  return { allowed: true, key };
}

export function mapPost(row) {
  return {
    id: row.id,
    type: row.type,
    titleEn: row.title_en,
    titleHu: row.title_hu,
    bodyEn: row.body_en,
    bodyHu: row.body_hu,
    category: row.category,
    author: row.author,
    date: row.created_at,
    comments: Number(row.comments || 0),
    votes: Number(row.votes || 0),
    solved: Boolean(row.solved),
    status: row.status || null,
    featured: Boolean(row.featured),
    hidden: Boolean(row.is_hidden),
    pinned: Boolean(row.is_pinned),
    locked: Boolean(row.is_locked),
  };
}

export function mapComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    author: row.author,
    body: row.body,
    date: row.created_at,
  };
}

function parseCookieHeader(request) {
  const raw = request.headers.get('cookie') || '';
  return Object.fromEntries(raw.split(';').map(v => v.trim()).filter(Boolean).map(pair => {
    const i = pair.indexOf('=');
    return [decodeURIComponent(pair.slice(0, i)), decodeURIComponent(pair.slice(i + 1))];
  }));
}

export async function requireUser(context) {
  const token = parseCookieHeader(context.request).openrf_session;

  if (!token) {
    return {
      user: null,
      response: error('Sign in with GitHub to continue.', 401),
    };
  }

  const tokenHash = await sha256Hex(token);

  const user = await context.env.COMMUNITY_DB.prepare(`
    SELECT
      u.id,
      u.login,
      u.display_name,
      u.avatar_url,
      u.profile_url,
      CASE
        WHEN LOWER(u.login) = 'krissz55555' THEN 1
        ELSE 0
      END AS is_admin
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
      AND s.expires_at > ?
      AND u.is_blocked = 0
  `).bind(tokenHash, new Date().toISOString()).first();

  if (!user) {
    return {
      user: null,
      response: error('Your session has expired. Please sign in again.', 401),
    };
  }

  return {
    user,
    response: null,
  };
}

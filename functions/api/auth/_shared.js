const encoder = new TextEncoder();

export const authJson = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: {'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers},
});

export function parseCookies(request) {
  const raw = request.headers.get('cookie') || '';
  return Object.fromEntries(raw.split(';').map(v => v.trim()).filter(Boolean).map(pair => {
    const i = pair.indexOf('=');
    return [decodeURIComponent(pair.slice(0, i)), decodeURIComponent(pair.slice(i + 1))];
  }));
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2,'0')).join('');
}

export function randomToken(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
}

export function cookie(name, value, options = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`,'Path=/','HttpOnly','Secure','SameSite=Lax'];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join('; ');
}

export async function currentUser(context) {
  const token = parseCookies(context.request).openrf_session;
  if (!token) return null;
  const hash = await sha256(token);
  const user = await context.env.COMMUNITY_DB.prepare(`
    SELECT u.id, u.login, u.display_name, u.avatar_url, u.profile_url
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.is_blocked = 0
  `).bind(hash, new Date().toISOString()).first();
  return user || null;
}

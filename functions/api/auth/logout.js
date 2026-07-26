import { authJson, cookie, parseCookies, sha256 } from './_shared.js';
export async function onRequestPost(context) {
  const token = parseCookies(context.request).openrf_session;
  if (token) await context.env.COMMUNITY_DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return authJson({ok:true},200,{'Set-Cookie':cookie('openrf_session','',{maxAge:0})});
}

import { cookie, parseCookies, randomToken, sha256 } from '../_shared.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const expected = parseCookies(context.request).openrf_oauth_state;
    if (!code || !state || !expected || state !== expected) return new Response('Invalid OAuth state.', {status:400});

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method:'POST',
      headers:{'accept':'application/json','content-type':'application/json','user-agent':'OpenRF-Platform'},
      body:JSON.stringify({client_id:context.env.GITHUB_CLIENT_ID,client_secret:context.env.GITHUB_CLIENT_SECRET,code,redirect_uri:new URL('/api/auth/github/callback', context.request.url).toString()})
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return new Response('GitHub sign-in failed.', {status:502});

    const userRes = await fetch('https://api.github.com/user', {headers:{Authorization:`Bearer ${tokenData.access_token}`,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'OpenRF-Platform'}});
    const gh = await userRes.json();
    if (!userRes.ok || !gh.id || !gh.login) return new Response('Could not read GitHub profile.', {status:502});

    const now = new Date().toISOString();
    const userId = `github_${gh.id}`;
    const displayName = String(gh.name || gh.login).slice(0,60);
    await context.env.COMMUNITY_DB.prepare(`
      INSERT INTO users (id, github_id, login, display_name, avatar_url, profile_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(github_id) DO UPDATE SET login=excluded.login, display_name=excluded.display_name, avatar_url=excluded.avatar_url, profile_url=excluded.profile_url, updated_at=excluded.updated_at
    `).bind(userId, gh.id, gh.login, displayName, gh.avatar_url || '', gh.html_url || '', now, now).run();

    const token = randomToken(32);
    const hash = await sha256(token);
    const expires = new Date(Date.now() + 30*24*60*60*1000).toISOString();
    await context.env.COMMUNITY_DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now).run();
    await context.env.COMMUNITY_DB.prepare('INSERT INTO sessions (token_hash,user_id,created_at,expires_at) VALUES (?,?,?,?)').bind(hash,userId,now,expires).run();

    return new Response(null,{status:302,headers:{Location:'/community.html','Set-Cookie':cookie('openrf_session',token,{maxAge:30*24*60*60})}});
  } catch (error) {
    console.error(error);
    return new Response('GitHub sign-in failed.', {status:500});
  }
}

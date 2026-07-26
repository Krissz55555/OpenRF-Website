import { cookie, randomToken } from '../_shared.js';

export async function onRequestGet(context) {
  if (!context.env.GITHUB_CLIENT_ID) return new Response('GitHub OAuth is not configured.', {status:503});
  const state = randomToken(24);
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', context.env.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', new URL('/api/auth/github/callback', context.request.url).toString());
  url.searchParams.set('scope', 'read:user');
  url.searchParams.set('state', state);
  return new Response(null, {status:302, headers:{Location:url.toString(),'Set-Cookie':cookie('openrf_oauth_state', state, {maxAge:600})}});
}

import { cleanText, enforceRateLimit, error, json, makeId, mapComment, readJson, requireUser } from '../../_shared.js';

export async function onRequestGet(context) {
  try {
    const id = context.params.id;
    const post = await context.env.COMMUNITY_DB.prepare('SELECT is_hidden FROM posts WHERE id = ?').bind(id).first();
    if (!post) return error('Post not found', 404);
    if (Number(post.is_hidden || 0) === 1) {
      const auth = await requireUser(context);
      if (auth.response) return auth.response;
      if (Number(auth.user.is_admin || 0) !== 1) return error('Post not found', 404);
    }
    const result = await context.env.COMMUNITY_DB.prepare(`
      SELECT id, post_id, author, body, created_at
      FROM comments
      WHERE post_id = ? AND is_hidden = 0
      ORDER BY created_at ASC
      LIMIT 500
    `).bind(id).all();
    return json({ ok: true, comments: result.results.map(mapComment) });
  } catch (err) {
    console.error(err);
    return error('Could not load comments', 500);
  }
}

export async function onRequestPost(context) {
  try {
    const auth = await requireUser(context);
    if (auth.response) return auth.response;
    const rate = await enforceRateLimit(context, 'create_comment', 20, 3600);
    if (!rate.allowed) return error('Too many comments. Please try again later.', 429);

    const postId = context.params.id;
    const exists = await context.env.COMMUNITY_DB.prepare('SELECT id, is_locked FROM posts WHERE id = ? AND is_hidden = 0').bind(postId).first();
    if (!exists) return error('Post not found', 404);
    if (Number(exists.is_locked || 0) === 1) return error('This topic is locked', 423);

    const input = await readJson(context.request);
    if (cleanText(input.website, 100)) return json({ ok: true, ignored: true });
    const author = cleanText(auth.user.display_name || auth.user.login, 60);
    const body = cleanText(input.body, 1200);
    if (body.length < 2) return error('The comment is too short');

    const id = makeId('comment');
    const now = new Date().toISOString();
    await context.env.COMMUNITY_DB.prepare(`
      INSERT INTO comments (id, post_id, author, body, created_at, is_hidden)
      VALUES (?, ?, ?, ?, ?, 0)
    `).bind(id, postId, author, body, now).run();

    return json({ ok: true, comment: { id, postId, author, body, date: now } }, 201);
  } catch (err) {
    console.error(err);
    return error(err.message === 'JSON body required' ? err.message : 'Could not publish the comment', err.message === 'JSON body required' ? 415 : 500);
  }
}

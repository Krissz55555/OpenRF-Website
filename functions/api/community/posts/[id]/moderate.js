import { error, json, mapPost, readJson, requireUser } from '../../_shared.js';

const actions = {
  pin: ['is_pinned', 1],
  unpin: ['is_pinned', 0],
  lock: ['is_locked', 1],
  unlock: ['is_locked', 0],
  feature: ['featured', 1],
  unfeature: ['featured', 0],
  hide: ['is_hidden', 1],
  restore: ['is_hidden', 0],
};

export async function onRequestPost(context) {
  try {
    const auth = await requireUser(context);
    if (auth.response) return auth.response;
    if (Number(auth.user.is_admin || 0) !== 1) return error('Admin permission required', 403);

    const postId = String(context.params.id || '').trim();
    const input = await readJson(context.request);
    const action = String(input.action || '').trim().toLowerCase();
    const change = actions[action];
    if (!postId) return error('Post ID is required');
    if (!change) return error('Invalid moderation action');

    const exists = await context.env.COMMUNITY_DB.prepare('SELECT id FROM posts WHERE id = ?').bind(postId).first();
    if (!exists) return error('Post not found', 404);

    const [column, value] = change;
    await context.env.COMMUNITY_DB.prepare(`UPDATE posts SET ${column} = ? WHERE id = ?`).bind(value, postId).run();

    const row = await context.env.COMMUNITY_DB.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_hidden = 0) AS comments,
        (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id) AS votes
      FROM posts p WHERE p.id = ?
    `).bind(postId).first();

    return json({ ok: true, action, post: mapPost(row) });
  } catch (err) {
    console.error('Moderation action failed:', err);
    if (err?.message === 'JSON body required') return error(err.message, 415);
    return error('Could not update the topic', 500);
  }
}

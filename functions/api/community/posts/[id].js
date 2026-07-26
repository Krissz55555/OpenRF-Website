import { error, json, mapPost, requireUser } from '../_shared.js';

export async function onRequestGet(context) {
  try {
    const id = context.params.id;
    const row = await context.env.COMMUNITY_DB.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_hidden = 0) AS comments,
        (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id) AS votes
      FROM posts p
      WHERE p.id = ? AND p.is_hidden = 0
    `).bind(id).first();
    if (!row) return error('Post not found', 404);
    return json({ ok: true, post: mapPost(row) });
  } catch (err) {
    console.error(err);
    return error('Could not load the post', 500);
  }
}


export async function onRequestDelete(context) {
  try {
    const auth = await requireUser(context);
    if (auth.response) return auth.response;
    if (Number(auth.user.is_admin || 0) !== 1) return error('Admin permission required', 403);

    const id = String(context.params.id || '').trim();
    const exists = await context.env.COMMUNITY_DB.prepare('SELECT id FROM posts WHERE id = ?').bind(id).first();
    if (!exists) return error('Post not found', 404);

    await context.env.COMMUNITY_DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    return json({ ok: true, deleted: true, postId: id });
  } catch (err) {
    console.error('Delete post failed:', err);
    return error('Could not delete the topic', 500);
  }
}

import { error, json, mapPost } from '../_shared.js';

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

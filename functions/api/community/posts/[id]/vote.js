import { error, json, requireUser } from '../../_shared.js';

export async function onRequestPost(context) {
  try {
    const auth = await requireUser(context);
    if (auth.response) return auth.response;
    const postId = context.params.id;
    const post = await context.env.COMMUNITY_DB.prepare("SELECT id FROM posts WHERE id = ? AND type = 'ideas' AND is_hidden = 0").bind(postId).first();
    if (!post) return error('Idea not found', 404);

    const voterKey = auth.user.id;
    const current = await context.env.COMMUNITY_DB.prepare('SELECT post_id FROM votes WHERE post_id = ? AND voter_key = ?').bind(postId, voterKey).first();
    let voted;
    if (current) {
      await context.env.COMMUNITY_DB.prepare('DELETE FROM votes WHERE post_id = ? AND voter_key = ?').bind(postId, voterKey).run();
      voted = false;
    } else {
      await context.env.COMMUNITY_DB.prepare('INSERT INTO votes (post_id, voter_key, created_at) VALUES (?, ?, ?)').bind(postId, voterKey, new Date().toISOString()).run();
      voted = true;
    }
    const count = await context.env.COMMUNITY_DB.prepare('SELECT COUNT(*) AS total FROM votes WHERE post_id = ?').bind(postId).first();
    return json({ ok: true, voted, votes: Number(count?.total || 0) });
  } catch (err) {
    console.error(err);
    return error('Could not update the vote', 500);
  }
}

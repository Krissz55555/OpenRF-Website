import {
  error,
  json,
  readJson,
  requireUser,
} from '../../_shared.js';

export async function onRequestPost(context) {
  try {
    const auth = await requireUser(context);

    if (auth.response) {
      return auth.response;
    }

    if (Number(auth.user.is_admin || 0) !== 1) {
      return error('Admin permission required', 403);
    }

    const postId = String(context.params.id || '').trim();

    if (!postId) {
      return error('Post ID is required');
    }

    const input = await readJson(context.request);

    if (input.hidden !== true) {
      return error('Invalid hidden state');
    }

    const post = await context.env.COMMUNITY_DB.prepare(`
      SELECT id, is_hidden
      FROM posts
      WHERE id = ?
    `).bind(postId).first();

    if (!post) {
      return error('Post not found', 404);
    }

    if (Number(post.is_hidden || 0) === 1) {
      return json({
        ok: true,
        postId,
        hidden: true,
        unchanged: true,
      });
    }

    await context.env.COMMUNITY_DB.prepare(`
      UPDATE posts
      SET is_hidden = 1
      WHERE id = ?
    `).bind(postId).run();

    return json({
      ok: true,
      postId,
      hidden: true,
    });
  } catch (err) {
    console.error('Hide post failed:', err);

    if (err?.message === 'JSON body required') {
      return error(err.message, 415);
    }

    return error('Could not hide the post', 500);
  }
}
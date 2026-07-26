import { cleanText, enforceRateLimit, error, json, makeId, mapPost, readJson, requireUser, validCategories, validTypes } from './_shared.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const type = cleanText(url.searchParams.get('type') || '', 20);
    const query = cleanText(url.searchParams.get('q') || '', 80).toLowerCase();
    const params = [];
    const where = [];

    if (type) {
      if (!validTypes.has(type)) return error('Invalid post type');
      where.push('p.type = ?');
      params.push(type);
    }
    if (query) {
      where.push('(LOWER(p.title_en) LIKE ? OR LOWER(p.title_hu) LIKE ? OR LOWER(p.body_en) LIKE ? OR LOWER(p.body_hu) LIKE ? OR LOWER(p.category) LIKE ?)');
      const like = `%${query}%`;
      params.push(like, like, like, like, like);
    }

    const sql = `
      SELECT p.*,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_hidden = 0) AS comments,
        (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id) AS votes
      FROM posts p
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      AND p.is_hidden = 0
      ORDER BY p.featured DESC, p.created_at DESC
      LIMIT 250
    `.replace('FROM posts p\n      AND', 'FROM posts p\n      WHERE');

    const result = await context.env.COMMUNITY_DB.prepare(sql).bind(...params).all();
    return json({ ok: true, posts: result.results.map(mapPost) });
  } catch (err) {
    console.error(err);
    return error('Could not load community posts', 500);
  }
}

export async function onRequestPost(context) {
  try {
    const auth = await requireUser(context);
    if (auth.response) return auth.response;
    const rate = await enforceRateLimit(context, 'create_post', 5, 3600);
    if (!rate.allowed) return error('Too many new posts. Please try again later.', 429);

    const body = await readJson(context.request);
    if (cleanText(body.website, 100)) return json({ ok: true, ignored: true });

    const type = cleanText(body.type, 20);
    const title = cleanText(body.title, 100);
    const details = cleanText(body.body, 1400);
    const author = cleanText(auth.user.display_name || auth.user.login, 60);
    const category = cleanText(body.category || 'General', 40);
    const lang = body.language === 'hu' ? 'hu' : 'en';

    if (!validTypes.has(type)) return error('Invalid post type');
    if (!validCategories.has(category)) return error('Invalid category');
    if (title.length < 5) return error('The title is too short');
    if (details.length < 10) return error('The post details are too short');

    const id = makeId('post');
    const now = new Date().toISOString();
    const status = type === 'ideas' ? 'review' : null;
    const titleEn = title;
    const titleHu = title;
    const bodyEn = details;
    const bodyHu = details;

    await context.env.COMMUNITY_DB.prepare(`
      INSERT INTO posts
      (id, type, title_en, title_hu, body_en, body_hu, category, author, created_at, solved, status, featured, source_language)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?)
    `).bind(id, type, titleEn, titleHu, bodyEn, bodyHu, category, author, now, status, lang).run();

    const row = await context.env.COMMUNITY_DB.prepare(`
      SELECT p.*, 0 AS comments, 0 AS votes FROM posts p WHERE p.id = ?
    `).bind(id).first();

    return json({ ok: true, post: mapPost(row) }, 201);
  } catch (err) {
    console.error(err);
    return error(err.message === 'JSON body required' ? err.message : 'Could not publish the post', err.message === 'JSON body required' ? 415 : 500);
  }
}

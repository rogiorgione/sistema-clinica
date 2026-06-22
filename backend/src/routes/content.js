const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');

const router = express.Router();
const validStatuses = ['Pendente', 'Agendado', 'Publicado'];
const validFormats = ['Reels', 'Stories', 'Carrosséis'];
const futureIntegrations = ['Instagram Graph API', 'TikTok Business API', 'Facebook Graph API', 'Metricool API'];

function periodWhere(query) {
  const where = [];
  const params = [];
  if (query.day) { where.push('scheduled_date = ?'); params.push(query.day); }
  if (query.week) { where.push('week = ?'); params.push(query.week); }
  if (query.month) { where.push('month = ?'); params.push(query.month); }
  if (query.category) { where.push('category = ?'); params.push(query.category); }
  if (query.status) { where.push('status = ?'); params.push(query.status); }
  if (query.format) { where.push('format = ?'); params.push(query.format); }
  return { clause: where.length ? ` WHERE ${where.join(' AND ')}` : '', params };
}

function postPayload(body) {
  return {
    idea_id: body.idea_id || null,
    title: body.title,
    scheduled_date: body.scheduled_date,
    week: body.week,
    month: body.month,
    platform: body.platform || 'Instagram',
    format: body.format || 'Reels',
    category: body.category,
    status: validStatuses.includes(body.status) ? body.status : 'Pendente',
    hook: body.hook,
    script: body.script,
    caption: body.caption,
    cta: body.cta,
    hashtags: body.hashtags,
    duration_seconds: body.duration_seconds || 30,
    integration_target: body.integration_target || null,
    external_post_id: body.external_post_id || null,
    notes: body.notes || null,
  };
}

router.get('/dashboard', async (req, res, next) => {
  try {
    const [planned, published, byFormat, byCategory, byStatus, metrics] = await Promise.all([
      get("SELECT COUNT(*) AS total FROM content_posts WHERE status IN ('Pendente', 'Agendado')"),
      get("SELECT COUNT(*) AS total FROM content_posts WHERE status = 'Publicado'"),
      all('SELECT format, COUNT(*) AS total FROM content_posts GROUP BY format ORDER BY total DESC'),
      all('SELECT category, COUNT(*) AS total FROM content_posts GROUP BY category ORDER BY total DESC, category ASC'),
      all('SELECT status, COUNT(*) AS total FROM content_posts GROUP BY status ORDER BY status ASC'),
      all('SELECT platform, SUM(reach) AS reach, SUM(views) AS views, SUM(likes) AS likes, SUM(comments) AS comments, SUM(shares) AS shares FROM content_metrics GROUP BY platform ORDER BY platform ASC'),
    ]);
    res.json({ planned_posts: planned.total, published_posts: published.total, by_format: byFormat, by_category: byCategory, by_status: byStatus, metrics, future_integrations: futureIntegrations });
  } catch (error) { next(error); }
});

router.get('/calendar', async (req, res, next) => {
  try { const { clause, params } = periodWhere(req.query); res.json(await all(`SELECT * FROM content_calendar${clause} ORDER BY scheduled_date ASC, platform ASC, format ASC`, params)); } catch (error) { next(error); }
});

router.get('/ideas', async (req, res, next) => {
  try { const { clause, params } = periodWhere(req.query); res.json(await all(`SELECT * FROM content_ideas${clause} ORDER BY day_number ASC, format ASC`, params)); } catch (error) { next(error); }
});

router.get('/stories', async (req, res, next) => {
  try { const { clause, params } = periodWhere({ ...req.query, format: 'Stories' }); res.json(await all(`SELECT * FROM content_ideas${clause} ORDER BY day_number ASC`, params)); } catch (error) { next(error); }
});

router.get('/posts', async (req, res, next) => {
  try { const { clause, params } = periodWhere(req.query); res.json(await all(`SELECT * FROM content_posts${clause} ORDER BY scheduled_date ASC, platform ASC`, params)); } catch (error) { next(error); }
});

router.post('/posts', async (req, res, next) => {
  try {
    const data = postPayload(req.body);
    if (!data.title || !data.scheduled_date || !data.category) return res.status(400).json({ error: 'Título, data e categoria são obrigatórios.' });
    const fields = Object.keys(data);
    const result = await run(`INSERT INTO content_posts (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, Object.values(data));
    await audit(req, 'create', 'content:posts', `Post ${result.id}`);
    res.status(201).json(await get('SELECT * FROM content_posts WHERE id = ?', [result.id]));
  } catch (error) { next(error); }
});

router.put('/posts/:id', async (req, res, next) => {
  try {
    const data = postPayload(req.body);
    const fields = Object.keys(data);
    const result = await run(`UPDATE content_posts SET ${fields.map((field) => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...Object.values(data), req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'Post não encontrado.' });
    await audit(req, 'update', 'content:posts', `Post ${req.params.id}`);
    res.json(await get('SELECT * FROM content_posts WHERE id = ?', [req.params.id]));
  } catch (error) { next(error); }
});

module.exports = router;

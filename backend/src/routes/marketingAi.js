const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');

const router = express.Router();
const tables = {
  calendar: { table: 'marketing_content_calendar', order: 'publish_date ASC, id ASC' },
  captions: { table: 'marketing_captions', order: 'updated_at DESC, id DESC' },
  reels: { table: 'marketing_reels', order: 'updated_at DESC, id DESC' },
  stories: { table: 'marketing_stories', order: 'updated_at DESC, id DESC' },
  metrics: { table: 'marketing_metrics', order: 'metric_date DESC, id DESC' },
  crm: { table: 'marketing_crm_leads', order: 'updated_at DESC, id DESC' },
  agenda: { table: 'marketing_commercial_agenda', order: 'contact_date ASC, contact_time ASC, id ASC' },
  whatsapp: { table: 'marketing_whatsapp_templates', order: 'category ASC, id ASC' },
};
const searchColumns = {
  calendar: ['title','channel','content_type','category','status','caption','cta','hashtags','notes'],
  captions: ['title','category','caption','cta','hashtags'],
  reels: ['title','category','hook','script','cta'],
  stories: ['title','category','script','cta'],
  metrics: ['platform'],
  crm: ['name','phone','source','interest','stage','notes'],
  agenda: ['lead_name','channel','reason','status','notes'],
  whatsapp: ['title','category','message'],
};
const columns = {
  calendar: ['title','publish_date','week','channel','content_type','category','status','caption','cta','hashtags','notes'],
  captions: ['title','category','caption','cta','hashtags'],
  reels: ['title','category','hook','script','cta','duration_seconds'],
  stories: ['title','category','script','cta'],
  metrics: ['platform','metric_date','reach','views','followers','likes','shares'],
  crm: ['name','phone','source','interest','stage','notes','next_contact_date'],
  agenda: ['lead_name','contact_date','contact_time','channel','reason','status','notes'],
  whatsapp: ['title','category','message'],
};

function pick(body, resource) {
  return Object.fromEntries(columns[resource].map((field) => [field, body[field] ?? null]));
}

router.get('/summary', async (req, res, next) => {
  try {
    const result = {};
    for (const [key, config] of Object.entries(tables)) {
      const row = await get(`SELECT COUNT(*) AS total FROM ${config.table}`);
      result[key] = row.total;
    }
    res.json(result);
  } catch (error) { next(error); }
});

router.get('/:resource', async (req, res, next) => {
  try {
    const config = tables[req.params.resource];
    if (!config) return res.status(404).json({ error: 'Recurso de marketing não encontrado.' });
    const search = `%${req.query.search || ''}%`;
    const category = req.query.category || null;
    const where = [];
    const params = [];
    if (req.query.search) {
      const searchable = searchColumns[req.params.resource];
      where.push(`(${searchable.map((field) => `${field} LIKE ?`).join(' OR ')})`);
      params.push(...searchable.map(() => search));
    }
    if (category) { where.push('category = ?'); params.push(category); }
    const sql = `SELECT * FROM ${config.table}${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY ${config.order}`;
    res.json(await all(sql, params));
  } catch (error) { next(error); }
});

router.post('/:resource', async (req, res, next) => {
  try {
    const config = tables[req.params.resource];
    if (!config) return res.status(404).json({ error: 'Recurso de marketing não encontrado.' });
    const data = pick(req.body, req.params.resource);
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const result = await run(`INSERT INTO ${config.table} (${fields.join(', ')}) VALUES (${placeholders})`, Object.values(data));
    await audit(req, 'create', `marketing-ai:${req.params.resource}`, `Registro ${result.id}`);
    res.status(201).json(await get(`SELECT * FROM ${config.table} WHERE id = ?`, [result.id]));
  } catch (error) { next(error); }
});

router.put('/:resource/:id', async (req, res, next) => {
  try {
    const config = tables[req.params.resource];
    if (!config) return res.status(404).json({ error: 'Recurso de marketing não encontrado.' });
    const data = pick(req.body, req.params.resource);
    const fields = Object.keys(data);
    const result = await run(`UPDATE ${config.table} SET ${fields.map((field) => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...Object.values(data), req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'Registro não encontrado.' });
    await audit(req, 'update', `marketing-ai:${req.params.resource}`, `Registro ${req.params.id}`);
    res.json(await get(`SELECT * FROM ${config.table} WHERE id = ?`, [req.params.id]));
  } catch (error) { next(error); }
});

module.exports = router;

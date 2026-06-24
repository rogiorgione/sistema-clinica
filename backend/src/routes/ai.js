const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');

const router = express.Router();

const resources = {
  reels: { table: 'ai_reels', order: 'updated_at DESC, id DESC' },
  stories: { table: 'ai_stories', order: 'updated_at DESC, id DESC' },
  campaigns: { table: 'ai_campaigns', order: 'updated_at DESC, id DESC' },
  whatsapp: { table: 'ai_whatsapp', order: 'updated_at DESC, id DESC' },
  hooks: { table: 'ai_hooks', order: 'updated_at DESC, id DESC' },
  responses: { table: 'ai_responses', order: 'updated_at DESC, id DESC' },
  prompts: { table: 'ai_prompts', order: 'updated_at DESC, id DESC' },
};

const fields = ['title', 'category', 'prompt', 'content', 'cta', 'notes'];
const searchable = ['title', 'category', 'prompt', 'content', 'cta', 'notes'];

function pick(body) {
  return Object.fromEntries(fields.map((field) => [field, body[field] ?? null]));
}

router.get('/summary', async (req, res, next) => {
  try {
    const summary = {};
    for (const [key, config] of Object.entries(resources)) {
      const row = await get(`SELECT COUNT(*) AS total FROM ${config.table}`);
      summary[key] = row.total;
    }
    res.json(summary);
  } catch (error) { next(error); }
});

router.get('/agents', async (req, res, next) => {
  try {
    res.json(await all('SELECT * FROM ai_agents ORDER BY updated_at DESC, id DESC LIMIT 200'));
  } catch (error) { next(error); }
});

router.get('/:resource', async (req, res, next) => {
  try {
    const config = resources[req.params.resource];
    if (!config) return res.status(404).json({ error: 'Recurso de IA não encontrado.' });
    const params = [];
    const where = [];
    if (req.query.search) {
      where.push(`(${searchable.map((field) => `${field} LIKE ?`).join(' OR ')})`);
      params.push(...searchable.map(() => `%${req.query.search}%`));
    }
    if (req.query.category) {
      where.push('category = ?');
      params.push(req.query.category);
    }
    res.json(await all(`SELECT * FROM ${config.table}${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY ${config.order}`, params));
  } catch (error) { next(error); }
});

router.post('/:resource', async (req, res, next) => {
  try {
    const config = resources[req.params.resource];
    if (!config) return res.status(404).json({ error: 'Recurso de IA não encontrado.' });
    const data = pick(req.body);
    if (!data.title || !data.category || !data.content) return res.status(400).json({ error: 'Título, categoria e conteúdo são obrigatórios.' });
    const result = await run(`INSERT INTO ${config.table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, fields.map((field) => data[field]));
    await audit(req, 'create', `ai:${req.params.resource}`, `Registro ${result.id}`);
    res.status(201).json(await get(`SELECT * FROM ${config.table} WHERE id = ?`, [result.id]));
  } catch (error) { next(error); }
});

router.put('/:resource/:id', async (req, res, next) => {
  try {
    const config = resources[req.params.resource];
    if (!config) return res.status(404).json({ error: 'Recurso de IA não encontrado.' });
    const data = pick(req.body);
    await run(`UPDATE ${config.table} SET ${fields.map((field) => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...fields.map((field) => data[field]), req.params.id]);
    await audit(req, 'update', `ai:${req.params.resource}`, `Registro ${req.params.id}`);
    res.json(await get(`SELECT * FROM ${config.table} WHERE id = ?`, [req.params.id]));
  } catch (error) { next(error); }
});

module.exports = router;

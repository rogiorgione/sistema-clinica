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
  crm: ['name','phone','phone_whatsapp','source','campaign','interest','status','stage','notes'],
  agenda: ['lead_name','channel','reason','status','notes'],
  whatsapp: ['title','category','message'],
};
const columns = {
  calendar: ['title','publish_date','week','channel','content_type','category','status','caption','cta','hashtags','notes'],
  captions: ['title','category','caption','cta','hashtags'],
  reels: ['title','category','hook','script','cta','duration_seconds'],
  stories: ['title','category','script','cta'],
  metrics: ['platform','metric_date','reach','views','followers','likes','shares'],
  crm: ['name','phone','phone_whatsapp','source','campaign','interest','status','stage','next_contact_date','last_contact_at','notes'],
  agenda: ['lead_name','contact_date','contact_time','channel','reason','status','notes'],
  whatsapp: ['title','category','message'],
};

function pick(body, resource) {
  const data = Object.fromEntries(columns[resource].map((field) => [field, body[field] ?? null]));
  if (resource === 'crm') {
    data.phone_whatsapp = data.phone_whatsapp || data.phone || null;
    data.phone = data.phone || data.phone_whatsapp || null;
    data.status = data.status || data.stage || 'Novo lead';
    data.stage = data.status;
  }
  return data;
}

function todayIso() { return new Date().toISOString().slice(0, 10); }

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizePhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

async function commercialDashboard() {
  const total = await get('SELECT COUNT(*) AS total FROM marketing_crm_leads');
  const scheduled = await get('SELECT COUNT(*) AS total FROM marketing_crm_leads WHERE status = ?', ['Avaliação marcada']);
  const closed = await get('SELECT COUNT(*) AS total FROM marketing_crm_leads WHERE status = ?', ['Fechado']);
  const lost = await get('SELECT COUNT(*) AS total FROM marketing_crm_leads WHERE status = ?', ['Perdido']);
  return {
    total_leads: total.total,
    scheduled_evaluations: scheduled.total,
    closed: closed.total,
    lost: lost.total,
    conversion_rate: total.total ? Math.round((closed.total / total.total) * 1000) / 10 : 0,
  };
}


router.get('/crm/dashboard', async (req, res, next) => {
  try { res.json(await commercialDashboard()); } catch (error) { next(error); }
});

router.get('/crm/agenda', async (req, res, next) => {
  try {
    const today = todayIso();
    const openWhere = "status NOT IN ('Fechado', 'Perdido') AND next_contact_date IS NOT NULL";
    const [todayItems, overdue, future] = await Promise.all([
      all(`SELECT * FROM marketing_crm_leads WHERE ${openWhere} AND next_contact_date = ? ORDER BY next_contact_date ASC, updated_at ASC`, [today]),
      all(`SELECT * FROM marketing_crm_leads WHERE ${openWhere} AND next_contact_date < ? ORDER BY next_contact_date ASC, updated_at ASC`, [today]),
      all(`SELECT * FROM marketing_crm_leads WHERE ${openWhere} AND next_contact_date > ? ORDER BY next_contact_date ASC, updated_at ASC`, [today]),
    ]);
    res.json({ today: todayItems, overdue, future });
  } catch (error) { next(error); }
});

router.post('/crm/:id/whatsapp-contact', async (req, res, next) => {
  try {
    const lead = await get('SELECT * FROM marketing_crm_leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });
    const nextContactDate = req.body.next_contact_date || addDaysIso(2);
    await run('UPDATE marketing_crm_leads SET last_contact_at = CURRENT_TIMESTAMP, next_contact_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nextContactDate, req.params.id]);
    await audit(req, 'whatsapp_contact', 'marketing-ai:crm', `Lead ${req.params.id}`);
    const updated = await get('SELECT * FROM marketing_crm_leads WHERE id = ?', [req.params.id]);
    const text = req.body.message || `Olá, ${lead.name}! Aqui é da BELLEART. Vi seu interesse em ${lead.interest || 'nossos tratamentos'} e quero te ajudar a agendar uma avaliação.`;
    res.json({ lead: updated, whatsapp_url: `https://wa.me/${normalizePhone(lead.phone_whatsapp || lead.phone)}?text=${encodeURIComponent(text)}` });
  } catch (error) { next(error); }
});

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

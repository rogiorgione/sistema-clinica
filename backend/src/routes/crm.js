const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');

const router = express.Router();
const stages = ['Novo lead', 'Contato feito', 'Avaliação marcada', 'Proposta enviada', 'Negociação', 'Fechado', 'Perdido'];

function todayIso() { return new Date().toISOString().slice(0, 10); }
function addDaysIso(days) { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); }
function percent(part, total) { return total ? Math.round((part / total) * 1000) / 10 : 0; }
function normalizePhone(phone = '') { const digits = String(phone).replace(/\D/g, ''); return digits ? (digits.startsWith('55') ? digits : `55${digits}`) : ''; }
function pick(body, fields) { return Object.fromEntries(fields.map((field) => [field, body[field] ?? null])); }

const resources = {
  pipeline: { table: 'crm_pipeline', order: 'position ASC, id ASC', fields: ['name', 'description', 'position', 'active'] },
  leads: { table: 'crm_contacts', order: 'updated_at DESC, id DESC', fields: ['name', 'phone', 'phone_whatsapp', 'email', 'source', 'campaign_id', 'interest', 'pipeline_stage', 'status', 'temperature', 'estimated_value', 'notes', 'next_contact_date'] },
  followups: { table: 'crm_followups', order: 'scheduled_date ASC, id ASC', fields: ['contact_id', 'task_id', 'channel', 'scheduled_date', 'scheduled_time', 'status', 'message', 'result'] },
  tasks: { table: 'crm_tasks', order: 'due_date ASC, id ASC', fields: ['contact_id', 'title', 'description', 'due_date', 'due_time', 'priority', 'status', 'automatic'] },
  campaigns: { table: 'crm_campaigns', order: 'updated_at DESC, id DESC', fields: ['name', 'channel', 'budget', 'cost', 'status', 'start_date', 'end_date', 'objective', 'notes'] },
  objections: { table: 'crm_objections', order: 'updated_at DESC, id DESC', fields: ['contact_id', 'category', 'objection', 'suggested_response', 'status'] },
};

async function createAutomaticTasks(contactId, lead) {
  const dueDate = lead.next_contact_date || addDaysIso(1);
  await run(`INSERT INTO crm_tasks (contact_id, title, description, due_date, priority, status, automatic)
    VALUES (?, ?, ?, ?, ?, ?, ?)`, [contactId, `Follow-up de ${lead.name}`, 'Tarefa automática criada para não perder o retorno comercial.', dueDate, 'Alta', 'Pendente', 1]);
  await run(`INSERT INTO crm_followups (contact_id, channel, scheduled_date, status, message)
    VALUES (?, ?, ?, ?, ?)`, [contactId, 'WhatsApp', dueDate, 'Pendente', `Olá, ${lead.name}! Podemos seguir com sua avaliação na BELLEART?`]);
  await run(`INSERT INTO crm_notifications (contact_id, type, title, message, due_date, status)
    VALUES (?, ?, ?, ?, ?, ?)`, [contactId, 'followup', 'Novo follow-up comercial', `Retornar o lead ${lead.name}.`, dueDate, 'Não lida']);
}

async function metrics() {
  const totals = await get(`SELECT COUNT(*) AS total, SUM(CASE WHEN pipeline_stage = 'Avaliação marcada' THEN 1 ELSE 0 END) AS evaluations, SUM(CASE WHEN pipeline_stage = 'Fechado' THEN 1 ELSE 0 END) AS closed, SUM(CASE WHEN pipeline_stage = 'Perdido' THEN 1 ELSE 0 END) AS lost, COALESCE(SUM(CASE WHEN pipeline_stage = 'Fechado' THEN estimated_value ELSE 0 END), 0) AS revenue FROM crm_contacts`);
  const byStage = await all('SELECT pipeline_stage AS stage, COUNT(*) AS total, COALESCE(SUM(estimated_value), 0) AS value FROM crm_contacts GROUP BY pipeline_stage ORDER BY total DESC');
  const campaignRanking = await all(`SELECT c.id, c.name, c.channel, c.budget, c.cost, COUNT(l.id) AS leads, SUM(CASE WHEN l.pipeline_stage = 'Fechado' THEN 1 ELSE 0 END) AS sales, COALESCE(SUM(CASE WHEN l.pipeline_stage = 'Fechado' THEN l.estimated_value ELSE 0 END), 0) AS revenue FROM crm_campaigns c LEFT JOIN crm_contacts l ON l.campaign_id = c.id GROUP BY c.id ORDER BY sales DESC, leads DESC, revenue DESC`);
  const openTasks = await get("SELECT COUNT(*) AS total FROM crm_tasks WHERE status != 'Concluída'");
  return { total_leads: totals.total || 0, evaluations: totals.evaluations || 0, closed: totals.closed || 0, lost: totals.lost || 0, revenue: totals.revenue || 0, conversion_rate: percent(totals.closed || 0, totals.total || 0), evaluation_rate: percent(totals.evaluations || 0, totals.total || 0), by_stage: byStage, campaign_ranking: campaignRanking.map((item) => ({ ...item, conversion_rate: percent(item.sales || 0, item.leads || 0), roi: item.cost ? Math.round(((item.revenue - item.cost) / item.cost) * 1000) / 10 : 0 })), open_tasks: openTasks.total || 0 };
}

router.get('/dashboard', async (req, res, next) => {
  try {
    const [leads, tasks, followups, notifications, metricData] = await Promise.all([
      all('SELECT * FROM crm_contacts ORDER BY updated_at DESC, id DESC'),
      all("SELECT * FROM crm_tasks WHERE status != 'Concluída' ORDER BY due_date ASC, id ASC LIMIT 8"),
      all("SELECT * FROM crm_followups WHERE status = 'Pendente' ORDER BY scheduled_date ASC, id ASC LIMIT 8"),
      all("SELECT * FROM crm_notifications WHERE status = 'Não lida' ORDER BY due_date ASC, id ASC LIMIT 8"),
      metrics(),
    ]);
    res.json({ stages, leads, tasks, followups, notifications, metrics: metricData });
  } catch (error) { next(error); }
});
router.get('/metrics', async (req, res, next) => { try { res.json(await metrics()); } catch (error) { next(error); } });

Object.entries(resources).forEach(([name, config]) => {
  router.get(`/${name}`, async (req, res, next) => { try { res.json(await all(`SELECT * FROM ${config.table} ORDER BY ${config.order}`)); } catch (error) { next(error); } });
  router.post(`/${name}`, async (req, res, next) => {
    try {
      const data = pick(req.body, config.fields);
      if (name === 'leads') { data.phone_whatsapp = data.phone_whatsapp || data.phone; data.phone = data.phone || data.phone_whatsapp; data.pipeline_stage = data.pipeline_stage || data.status || 'Novo lead'; data.status = data.status || data.pipeline_stage; }
      const fields = Object.keys(data);
      const result = await run(`INSERT INTO ${config.table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, Object.values(data));
      if (name === 'leads') await createAutomaticTasks(result.id, data);
      await audit(req, 'create', `crm:${name}`, `Registro ${result.id}`);
      res.status(201).json(await get(`SELECT * FROM ${config.table} WHERE id = ?`, [result.id]));
    } catch (error) { next(error); }
  });
  router.put(`/${name}/:id`, async (req, res, next) => {
    try {
      const data = pick(req.body, config.fields);
      if (name === 'leads') { data.phone_whatsapp = data.phone_whatsapp || data.phone; data.phone = data.phone || data.phone_whatsapp; data.pipeline_stage = data.pipeline_stage || data.status || 'Novo lead'; data.status = data.status || data.pipeline_stage; }
      const fields = Object.keys(data);
      const result = await run(`UPDATE ${config.table} SET ${fields.map((field) => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...Object.values(data), req.params.id]);
      if (!result.changes) return res.status(404).json({ error: 'Registro não encontrado.' });
      await audit(req, 'update', `crm:${name}`, `Registro ${req.params.id}`);
      res.json(await get(`SELECT * FROM ${config.table} WHERE id = ?`, [req.params.id]));
    } catch (error) { next(error); }
  });
});

router.post('/leads/:id/whatsapp-contact', async (req, res, next) => {
  try {
    const lead = await get('SELECT * FROM crm_contacts WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });
    const nextDate = req.body.next_contact_date || addDaysIso(2);
    await run('UPDATE crm_contacts SET last_contact_at = CURRENT_TIMESTAMP, next_contact_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nextDate, req.params.id]);
    await run('INSERT INTO crm_notifications (contact_id, type, title, message, due_date, status) VALUES (?, ?, ?, ?, ?, ?)', [req.params.id, 'whatsapp', 'Contato WhatsApp registrado', `Novo retorno agendado para ${lead.name}.`, nextDate, 'Não lida']);
    const message = req.body.message || `Olá, ${lead.name}! Aqui é da BELLEART. Podemos te ajudar com ${lead.interest || 'seu tratamento'}?`;
    res.json({ lead: await get('SELECT * FROM crm_contacts WHERE id = ?', [req.params.id]), whatsapp_url: `https://wa.me/${normalizePhone(lead.phone_whatsapp || lead.phone)}?text=${encodeURIComponent(message)}` });
  } catch (error) { next(error); }
});

module.exports = router;

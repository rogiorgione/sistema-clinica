const express = require('express');
const { all, get, run } = require('../database/connection');

const router = express.Router();
const stages = ['Novo Lead', 'Contatado', 'Avaliação', 'Negociação', 'Fechado', 'Perdido'];

function percent(part, total) { return total ? Math.round((part / total) * 1000) / 10 : 0; }
function today() { return new Date().toISOString().slice(0, 10); }
function month() { return today().slice(0, 7); }

router.get('/summary', async (req, res, next) => {
  try {
    const [patients, appointments, leads, leadCards, finance, marketing, automations, backups] = await Promise.all([
      get('SELECT COUNT(*) AS total FROM patients'),
      get(`SELECT COUNT(*) AS total, SUM(CASE WHEN status IN ('faltou','faltoso') THEN 1 ELSE 0 END) AS missed FROM appointments`),
      all('SELECT pipeline_stage AS stage, COUNT(*) AS total, COALESCE(SUM(estimated_value), 0) AS value FROM crm_contacts GROUP BY pipeline_stage'),
      all('SELECT id, name, interest, estimated_value, pipeline_stage AS stage FROM crm_contacts ORDER BY updated_at DESC, id DESC LIMIT 200'),
      all(`SELECT type, status, COALESCE(SUM(amount), 0) AS total FROM financial_records WHERE status != 'cancelado' GROUP BY type, status`),
      get(`SELECT COUNT(*) AS campaigns, COALESCE(SUM(cost), 0) AS cost FROM crm_campaigns`),
      get(`SELECT COUNT(*) AS total FROM marketing_automation_rules WHERE status = 'Ativa'`),
      all('SELECT * FROM enterprise_backups ORDER BY created_at DESC LIMIT 5'),
    ]);
    const income = finance.filter((item) => item.type === 'receita').reduce((sum, item) => sum + Number(item.total || 0), 0);
    const expenses = finance.filter((item) => item.type === 'despesa').reduce((sum, item) => sum + Number(item.total || 0), 0);
    const closed = leads.find((item) => item.stage === 'Fechado')?.total || 0;
    const totalLeads = leads.reduce((sum, item) => sum + Number(item.total || 0), 0);
    res.json({
      generated_at: new Date().toISOString(),
      stages,
      clinic: { patients: patients.total || 0, appointments: appointments.total || 0, missed_appointments: appointments.missed || 0 },
      crm: { total_leads: totalLeads, closed, conversion_rate: percent(closed, totalLeads), by_stage: leads, leads: leadCards },
      financial: { income, expenses, balance: income - expenses, dre_month: month() },
      marketing: { campaigns: marketing.campaigns || 0, investment: marketing.cost || 0, cpl: totalLeads ? Math.round((marketing.cost || 0) / totalLeads * 100) / 100 : 0 },
      automations: { active_rules: automations.total || 0 },
      backups,
    });
  } catch (error) { next(error); }
});

router.put('/crm/leads/:id/stage', async (req, res, next) => {
  try {
    const stage = req.body.stage;
    if (!stages.includes(stage)) return res.status(400).json({ error: 'Etapa inválida.' });
    const result = await run('UPDATE crm_contacts SET pipeline_stage = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [stage, stage, req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'Lead não encontrado.' });
    res.json(await get('SELECT * FROM crm_contacts WHERE id = ?', [req.params.id]));
  } catch (error) { next(error); }
});

router.post('/backups', async (req, res, next) => {
  try {
    const title = req.body.title || `Backup automático ${new Date().toLocaleString('pt-BR')}`;
    const result = await run('INSERT INTO enterprise_backups (title, backup_type, status, storage_path, notes) VALUES (?, ?, ?, ?, ?)', [title, req.body.backup_type || 'SQLite', 'Preparado', req.body.storage_path || 'local://database.sqlite', req.body.notes || 'Registro de backup criado sem remover dados existentes.']);
    res.status(201).json(await get('SELECT * FROM enterprise_backups WHERE id = ?', [result.id]));
  } catch (error) { next(error); }
});

module.exports = router;

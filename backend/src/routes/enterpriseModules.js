const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');

const router = express.Router();

const resources = {
  '/clinical/records': 'clinical_records', '/clinical/odontogram': 'clinical_odontogram', '/clinical/evolutions': 'clinical_evolutions', '/clinical/anamnesis': 'clinical_anamnesis', '/clinical/treatment-plans': 'clinical_treatment_plans', '/clinical/photos': 'clinical_photos', '/clinical/attachments': 'clinical_attachments', '/clinical/prescriptions': 'clinical_prescriptions', '/clinical/certificates': 'clinical_certificates', '/clinical/consent-terms': 'clinical_consent_terms', '/clinical/history': 'clinical_procedure_history',
  '/enterprise-crm/leads': 'enterprise_leads', '/enterprise-crm/stages': 'enterprise_pipeline_stages', '/enterprise-crm/history': 'enterprise_lead_history', '/enterprise-crm/tasks': 'enterprise_lead_tasks', '/enterprise-crm/scores': 'enterprise_lead_scores', '/enterprise-crm/sources': 'enterprise_lead_sources', '/enterprise-crm/campaigns': 'enterprise_lead_campaigns',
  '/secretary/tasks': 'virtual_secretary_tasks', '/secretary/alerts': 'virtual_secretary_alerts', '/secretary/suggestions': 'virtual_secretary_suggestions', '/secretary/priorities': 'virtual_secretary_priorities', '/secretary/call-queue': 'virtual_secretary_call_queue', '/secretary/followups': 'virtual_secretary_followups',
  '/ai/agents': 'ai_agents', '/ai/tasks': 'ai_agent_tasks', '/ai/outputs': 'ai_agent_outputs', '/ai/recommendations': 'ai_recommendations', '/ai/lead-scores': 'ai_lead_scores', '/ai/content': 'ai_content_generations', '/ai/reports': 'ai_report_generations', '/ai/prompts': 'ai_prompt_library',
  '/automations/rules': 'automation_rules', '/automations/triggers': 'automation_triggers', '/automations/actions': 'automation_actions', '/automations/logs': 'automation_logs', '/automations/queue': 'automation_queue', '/automations/conditions': 'automation_conditions',
  '/backup/jobs': 'backup_jobs', '/backup/files': 'backup_files', '/backup/logs': 'backup_logs', '/system/health': 'system_health', '/security/events': 'security_events', '/audit/events': 'audit_events',
};

function sanitizePayload(body = {}) {
  const blocked = ['password', 'senha', 'secret', 'client_secret', 'app_secret', 'access_token', 'refresh_token'];
  return Object.fromEntries(Object.entries(body).filter(([key]) => !blocked.some((term) => key.toLowerCase().includes(term))));
}

async function listTable(table, req, res, next) {
  try { res.json(await all(`SELECT * FROM ${table} ORDER BY updated_at DESC, id DESC LIMIT 500`)); } catch (error) { next(error); }
}

async function createRow(table, req, res, next) {
  try {
    const payload = sanitizePayload(req.body);
    const result = await run(`INSERT INTO ${table} (title, status, payload, created_by) VALUES (?, ?, ?, ?)`, [payload.title || payload.name || 'Registro Enterprise', payload.status || 'Preparado', JSON.stringify(payload), req.user.id]);
    await audit(req, 'create', table, `Registro Enterprise ${result.id}`);
    res.status(201).json(await get(`SELECT * FROM ${table} WHERE id = ?`, [result.id]));
  } catch (error) { next(error); }
}

async function updateRow(table, req, res, next) {
  try {
    const payload = sanitizePayload(req.body);
    const current = await get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
    if (!current) return res.status(404).json({ error: 'Registro não encontrado.' });
    const result = await run(`UPDATE ${table} SET title = ?, status = ?, payload = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [payload.title || payload.name || current.title, payload.status || current.status, JSON.stringify(payload), req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'Registro não encontrado.' });
    await audit(req, 'update', table, `Registro Enterprise ${req.params.id}`);
    res.json(await get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]));
  } catch (error) { next(error); }
}

for (const [path, table] of Object.entries(resources)) {
  router.get(path, (req, res, next) => listTable(table, req, res, next));
  router.post(path, (req, res, next) => createRow(table, req, res, next));
  router.put(`${path}/:id`, (req, res, next) => updateRow(table, req, res, next));
}

router.get('/clinical/dashboard', async (req, res, next) => {
  try {
    const tables = ['clinical_records','clinical_odontogram','clinical_evolutions','clinical_anamnesis','clinical_treatment_plans','clinical_photos','clinical_attachments','clinical_prescriptions','clinical_certificates','clinical_consent_terms','clinical_procedure_history'];
    const counts = {};
    for (const table of tables) counts[table] = (await get(`SELECT COUNT(*) AS total FROM ${table}`)).total || 0;
    res.json({ generated_at: new Date().toISOString(), counts });
  } catch (error) { next(error); }
});

router.get('/enterprise-crm/dashboard', async (req, res, next) => {
  try { res.json({ stages: await all('SELECT * FROM enterprise_pipeline_stages ORDER BY position, id'), leads: await all('SELECT * FROM enterprise_leads ORDER BY updated_at DESC LIMIT 200'), tasks: await all('SELECT * FROM enterprise_lead_tasks ORDER BY updated_at DESC LIMIT 100') }); } catch (error) { next(error); }
});
router.get('/secretary/dashboard', async (req, res, next) => {
  try { res.json({ priorities: await all('SELECT * FROM virtual_secretary_priorities ORDER BY updated_at DESC LIMIT 50'), alerts: await all('SELECT * FROM virtual_secretary_alerts ORDER BY updated_at DESC LIMIT 50'), call_queue: await all('SELECT * FROM virtual_secretary_call_queue ORDER BY updated_at DESC LIMIT 50') }); } catch (error) { next(error); }
});
router.get('/automations/dashboard', async (req, res, next) => {
  try { res.json({ rules: await all('SELECT * FROM automation_rules ORDER BY updated_at DESC LIMIT 100'), queue: await all('SELECT * FROM automation_queue ORDER BY updated_at DESC LIMIT 100'), logs: await all('SELECT * FROM automation_logs ORDER BY updated_at DESC LIMIT 100') }); } catch (error) { next(error); }
});

module.exports = router;

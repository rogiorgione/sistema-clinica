const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');

const router = express.Router();

const resources = {
  '/clinical/records': 'clinical_records', '/clinical/evolutions': 'clinical_evolutions', '/clinical/odontogram': 'clinical_odontogram', '/clinical/anamnesis': 'clinical_anamnesis', '/clinical/treatment-plans': 'clinical_treatment_plans', '/clinical/photos': 'clinical_photos', '/clinical/attachments': 'clinical_attachments', '/clinical/prescriptions': 'clinical_prescriptions', '/clinical/certificates': 'clinical_certificates', '/clinical/consent-terms': 'clinical_consent_terms',
  '/agenda/waitlist': 'appointment_waitlist', '/agenda/confirmations': 'appointment_confirmations', '/agenda/no-shows': 'appointment_no_shows', '/agenda/reschedules': 'appointment_reschedules', '/agenda/reminders': 'appointment_reminders', '/agenda/professionals': 'professional_schedules', '/agenda/google-calendar': 'google_calendar_links',
  '/enterprise-crm/leads': 'enterprise_leads', '/enterprise-crm/stages': 'enterprise_pipeline_stages', '/enterprise-crm/history': 'enterprise_lead_history', '/enterprise-crm/tasks': 'enterprise_lead_tasks', '/enterprise-crm/scores': 'enterprise_lead_scores',
  '/finance/cashflow': 'finance_cashflow', '/finance/revenues': 'finance_revenues', '/finance/expenses': 'finance_expenses', '/finance/payable': 'finance_accounts_payable', '/finance/receivable': 'finance_accounts_receivable', '/finance/installments': 'finance_installments', '/finance/overdue': 'finance_overdue', '/finance/goals': 'finance_goals', '/finance/commissions': 'finance_commissions', '/finance/production': 'finance_professional_production', '/finance/forecast': 'finance_forecasts', '/finance/dre': 'finance_dre',
  '/marketing/posts': 'marketing_posts', '/marketing/creatives': 'marketing_creatives', '/marketing/assets': 'marketing_assets', '/marketing/hashtags': 'marketing_hashtags', '/marketing/rankings/content': 'marketing_content_rankings', '/marketing/rankings/campaigns': 'marketing_campaign_rankings', '/marketing/roi': 'marketing_roi_reports',
  '/whatsapp-business/conversations': 'whatsapp_conversations', '/whatsapp-business/contacts': 'whatsapp_contacts', '/whatsapp-business/labels': 'whatsapp_labels', '/whatsapp-business/responsibles': 'whatsapp_responsibles', '/whatsapp-business/settings': 'whatsapp_business_settings', '/whatsapp-business/webhooks': 'whatsapp_webhook_events',
  '/ai/agents': 'ai_agents', '/ai/tasks': 'ai_tasks', '/ai/outputs': 'ai_outputs', '/ai/recommendations': 'ai_recommendations', '/ai/lead-scores': 'ai_lead_scores', '/ai/content': 'ai_content_generations', '/ai/reports': 'ai_report_generations', '/ai/prompts': 'ai_prompt_library',
  '/documents': 'documents', '/documents/templates': 'document_templates', '/documents/signatures': 'document_signatures', '/documents/patient-links': 'document_patient_links', '/documents/exports': 'document_exports',
  '/automations/rules': 'automation_rules', '/automations/triggers': 'automation_triggers', '/automations/actions': 'automation_actions', '/automations/logs': 'automation_logs', '/automations/queue': 'automation_queue',
  '/reports': 'reports', '/reports/templates': 'report_templates', '/reports/exports': 'report_exports', '/reports/schedules': 'report_schedules',
  '/backup/jobs': 'backup_jobs', '/backup/files': 'backup_files', '/backup/logs': 'backup_logs', '/system/health': 'system_health', '/security/events': 'security_events',
  '/saas/clinics': 'saas_clinics', '/saas/units': 'saas_units', '/saas/plans': 'saas_plans', '/saas/subscriptions': 'saas_subscriptions', '/saas/licenses': 'saas_licenses', '/saas/billing': 'saas_billing',
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
    const result = await run(`UPDATE ${table} SET title = ?, status = ?, payload = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [payload.title || payload.name || 'Registro Enterprise', payload.status || 'Preparado', JSON.stringify(payload), req.params.id]);
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

router.get('/agenda/day', async (req, res, next) => { try { res.json(await all('SELECT * FROM advanced_appointments WHERE date(start_at) = date(?) ORDER BY start_at', [req.query.date || new Date().toISOString().slice(0, 10)])); } catch (e) { next(e); } });
router.get('/agenda/week', async (req, res, next) => { try { res.json(await all("SELECT * FROM advanced_appointments WHERE date(start_at) BETWEEN date(?) AND date(?, '+6 days') ORDER BY start_at", [req.query.date || new Date().toISOString().slice(0, 10), req.query.date || new Date().toISOString().slice(0, 10)])); } catch (e) { next(e); } });
router.get('/agenda/month', async (req, res, next) => { try { res.json(await all("SELECT * FROM advanced_appointments WHERE strftime('%Y-%m', start_at) = ? ORDER BY start_at", [req.query.month || new Date().toISOString().slice(0, 7)])); } catch (e) { next(e); } });
router.get('/enterprise-crm/dashboard', async (req, res, next) => { try { res.json({ stages: await all('SELECT * FROM enterprise_pipeline_stages ORDER BY position'), leads: await all('SELECT * FROM enterprise_leads ORDER BY updated_at DESC LIMIT 200') }); } catch (e) { next(e); } });
router.get('/finance/dashboard', async (req, res, next) => { try { res.json({ dre: await all('SELECT * FROM finance_dre ORDER BY updated_at DESC LIMIT 12'), cashflow: await all('SELECT * FROM finance_cashflow ORDER BY updated_at DESC LIMIT 100') }); } catch (e) { next(e); } });

module.exports = router;

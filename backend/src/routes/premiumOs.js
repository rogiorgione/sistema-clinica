const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');

const router = express.Router();

const hotStatuses = ['Novo lead', 'Contato feito', 'Avaliação marcada', 'Proposta enviada', 'Negociação'];
const todayIso = () => new Date().toISOString().slice(0, 10);
const addDays = (days) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };
const money = (value) => Number(value || 0);
const percent = (part, total) => (money(total) ? Number(((money(part) / money(total)) * 100).toFixed(2)) : 0);

router.get('/dashboard', async (req, res, next) => {
  try {
    const [rules, goals, documents, leads] = await Promise.all([
      get('SELECT COUNT(*) AS total FROM marketing_automation_rules'),
      get('SELECT COUNT(*) AS total, COALESCE(SUM(target_amount), 0) AS target FROM financial_goals'),
      get('SELECT COUNT(*) AS total FROM document_center'),
      get('SELECT COUNT(*) AS total FROM crm_contacts'),
    ]);
    res.json({
      generatedAt: new Date().toISOString(),
      automations: rules.total || 0,
      financialGoals: { total: goals.total || 0, target: money(goals.target) },
      documents: documents.total || 0,
      crmLeads: leads.total || 0,
      status: 'operational',
    });
  } catch (error) { next(error); }
});

function leadScore(lead) {
  let score = 30;
  if (['Avaliação marcada', 'Proposta enviada', 'Negociação'].includes(lead.status || lead.pipeline_stage)) score += 25;
  if ((lead.interest || '').match(/implante|protocolo|ortodont/i)) score += 15;
  if (money(lead.estimated_value) >= 3000) score += 15;
  if (lead.next_contact_date && lead.next_contact_date <= addDays(1)) score += 10;
  if (!lead.last_contact_at) score += 5;
  return Math.min(score, 100);
}

function temperature(score) {
  if (score >= 75) return 'Quente';
  if (score >= 45) return 'Morno';
  return 'Frio';
}

function messageForLead(lead, score) {
  const treatment = lead.interest || 'avaliação odontológica';
  if (score >= 75) return `Olá, ${lead.name}! Aqui é da BELLEART. Vi que você demonstrou interesse em ${treatment}. Posso reservar um melhor horário para sua avaliação?`;
  if (!lead.last_contact_at) return `Olá, ${lead.name}! Sou da BELLEART. Recebemos seu contato sobre ${treatment} e queremos entender como podemos ajudar. Podemos conversar?`;
  return `Olá, ${lead.name}! Passando para saber se ainda faz sentido avançarmos com sua avaliação de ${treatment}. Posso te ajudar com horários?`;
}

router.get('/virtual-secretary', async (req, res, next) => {
  try {
    const leads = await all(`SELECT id, name, phone, phone_whatsapp, email, source, interest, status, pipeline_stage, estimated_value, next_contact_date, last_contact_at, created_at FROM crm_contacts ORDER BY updated_at DESC, id DESC LIMIT 80`);
    const patients = await all(`SELECT p.id, p.name, p.phone_whatsapp, MAX(a.appointment_date) AS last_appointment FROM patients p LEFT JOIN appointments a ON a.patient_id = p.id GROUP BY p.id ORDER BY last_appointment ASC LIMIT 80`);
    const prioritizedLeads = leads.map((lead) => {
      const score = leadScore(lead);
      return { ...lead, score, temperature: temperature(score), suggested_response: messageForLead(lead, score), next_action: score >= 75 ? 'Ligar hoje e enviar WhatsApp' : 'Enviar WhatsApp de nutrição', recommended_contact_date: lead.next_contact_date || todayIso() };
    }).sort((a, b) => b.score - a.score);
    const forgottenPatients = patients.filter((patient) => !patient.last_appointment || patient.last_appointment < addDays(-90)).slice(0, 20).map((patient) => ({ ...patient, suggested_message: `Olá, ${patient.name}! Sentimos sua falta na BELLEART. Podemos te ajudar a agendar uma revisão preventiva?`, suggested_action: 'Enviar WhatsApp de reativação' }));
    res.json({ generatedAt: new Date().toISOString(), hotLeads: prioritizedLeads.filter((lead) => lead.temperature === 'Quente').slice(0, 15), prioritizedLeads: prioritizedLeads.slice(0, 30), forgottenPatients });
  } catch (error) { next(error); }
});

router.get('/automatic-scheduling', async (req, res, next) => {
  try {
    const upcoming = await all(`SELECT a.*, p.name AS patient_name, p.phone_whatsapp FROM appointments a JOIN patients p ON p.id = a.patient_id WHERE a.appointment_date >= ? ORDER BY a.appointment_date, a.appointment_time LIMIT 50`, [todayIso()]);
    const missed = await all(`SELECT a.*, p.name AS patient_name, p.phone_whatsapp FROM appointments a JOIN patients p ON p.id = a.patient_id WHERE a.appointment_date < ? AND LOWER(a.status) NOT IN ('realizado','concluído','cancelado') ORDER BY a.appointment_date DESC LIMIT 50`, [todayIso()]);
    const waitlist = await all('SELECT * FROM appointment_waitlist ORDER BY priority DESC, requested_from ASC LIMIT 50');
    res.json({
      upcoming: upcoming.map((item) => ({ ...item, attendance_probability: item.status === 'confirmado' ? 92 : 68, confirmation_message: `Olá, ${item.patient_name}! Confirmamos sua consulta na BELLEART em ${item.appointment_date} às ${item.appointment_time}. Pode confirmar presença?`, reminder_message: `Lembrete BELLEART: sua consulta é em ${item.appointment_date} às ${item.appointment_time}. Te esperamos!` })),
      missed: missed.map((item) => ({ ...item, reschedule_message: `Olá, ${item.patient_name}! Notamos que você não conseguiu comparecer. Podemos reagendar para um novo horário?`, suggested_action: 'Ligar e oferecer reagendamento' })),
      waitlist,
      googleCalendar: { status: 'Preparado', provider: 'Google Calendar API', auth: 'OAuth 2.0', storesPassword: false },
    });
  } catch (error) { next(error); }
});

router.get('/executive-panel', async (req, res, next) => {
  try {
    const ads = await get('SELECT SUM(spent) AS cost, SUM(budget) AS budget FROM ads_campaigns');
    const adsMetrics = await get('SELECT SUM(leads) AS leads, SUM(revenue_generated) AS revenue, SUM(closed_treatments) AS closings FROM ads_metrics');
    const sales = await get("SELECT COUNT(*) AS total_sales, SUM(amount) AS revenue, AVG(amount) AS average_ticket FROM crm_sales WHERE status <> 'Cancelada'");
    const leads = await get('SELECT COUNT(*) AS total FROM crm_contacts');
    const financial = await get("SELECT SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END) AS revenue, SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END) AS expenses, SUM(CASE WHEN status <> 'pago' AND due_date < DATE('now') THEN amount ELSE 0 END) AS overdue FROM financial_records");
    res.json({ marketing: { roi: percent(money(adsMetrics.revenue) - money(ads.cost), ads.cost), cpl: money(adsMetrics.leads) ? Number((money(ads.cost) / money(adsMetrics.leads)).toFixed(2)) : 0, campaigns: await all('SELECT name, platform, status, budget, spent FROM ads_campaigns ORDER BY updated_at DESC LIMIT 10') }, commercial: { conversion: percent(sales.total_sales, leads.total), averageTicket: Number(money(sales.average_ticket).toFixed(2)), closings: sales.total_sales || 0 }, clinic: { revenue: money(financial.revenue), production: money(sales.revenue), overdue: money(financial.overdue) } });
  } catch (error) { next(error); }
});

router.get('/advanced-financial', async (req, res, next) => {
  try {
    const rows = await all('SELECT * FROM financial_records ORDER BY due_date DESC, id DESC LIMIT 200');
    const income = rows.filter((r) => r.type === 'receita').reduce((s, r) => s + money(r.amount), 0);
    const expenses = rows.filter((r) => r.type === 'despesa').reduce((s, r) => s + money(r.amount), 0);
    const overdue = rows.filter((r) => r.status !== 'pago' && r.due_date && r.due_date < todayIso()).reduce((s, r) => s + money(r.amount), 0);
    const goals = await all('SELECT * FROM financial_goals ORDER BY target_date LIMIT 20');
    const installments = await all('SELECT * FROM financial_installments ORDER BY due_date LIMIT 50');
    res.json({ cashFlow: { income, expenses, balance: income - expenses }, dre: { grossRevenue: income, operatingExpenses: expenses, result: income - expenses }, forecast: { next30DaysRevenue: rows.filter((r) => r.type === 'receita' && r.due_date >= todayIso() && r.due_date <= addDays(30)).reduce((s, r) => s + money(r.amount), 0) }, goals, installments, overdue, indicators: { delinquencyRate: percent(overdue, income), margin: percent(income - expenses, income) } });
  } catch (error) { next(error); }
});

router.get('/integrations', async (req, res, next) => {
  try {
    res.json(await all('SELECT provider, status, scopes, redirect_uri, notes FROM api_credentials ORDER BY provider'));
  } catch (error) { next(error); }
});

router.post('/waitlist', async (req, res, next) => {
  try {
    const result = await run('INSERT INTO appointment_waitlist (patient_id, patient_name, phone_whatsapp, requested_from, requested_to, procedure, priority, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.body.patient_id || null, req.body.patient_name, req.body.phone_whatsapp || null, req.body.requested_from || todayIso(), req.body.requested_to || null, req.body.procedure || 'Consulta', req.body.priority || 1, req.body.notes || null]);
    await audit(req, 'create', 'appointment_waitlist', `Encaixe ${result.id}`);
    res.status(201).json(await get('SELECT * FROM appointment_waitlist WHERE id = ?', [result.id]));
  } catch (error) { next(error); }
});

module.exports = router;

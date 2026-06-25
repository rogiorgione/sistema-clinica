const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');

const router = express.Router();
const money = (value) => Number(value || 0);
const percent = (part, total) => total ? Math.round((part / total) * 1000) / 10 : 0;
const today = () => new Date().toISOString().slice(0, 10);

const objectionRules = [
  { category: 'Preço', keywords: ['caro', 'preço', 'valor', 'desconto', 'orçamento'], action: 'Enviar opções de pagamento e reforçar avaliação individual.' },
  { category: 'Medo', keywords: ['medo', 'dor', 'anestesia', 'cirurgia', 'sofrer'], action: 'Acolher, explicar etapas em linguagem simples e oferecer conversa com especialista.' },
  { category: 'Tempo', keywords: ['tempo', 'agenda', 'demora', 'rápido', 'trabalho'], action: 'Sugerir horários próximos e mostrar duração estimada do tratamento.' },
  { category: 'Confiança', keywords: ['garantia', 'confiança', 'resultado', 'seguro', 'profissional'], action: 'Apresentar autoridade clínica, processo diagnóstico e próximos passos seguros.' },
];

function classifyObjection(text = '') {
  const normalized = text.toLowerCase();
  const matched = objectionRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  return matched || { category: 'Indecisão', keywords: [], action: 'Fazer pergunta consultiva e marcar retorno curto.' };
}

function buildObjectionResponse({ objection = '', patientName = 'paciente', treatment = 'tratamento indicado' }) {
  const rule = classifyObjection(objection);
  const response = {
    category: rule.category,
    suggested_response: `${patientName}, entendo sua preocupação sobre ${rule.category.toLowerCase()}. Na BELLEART nós avaliamos cada caso antes de indicar ${treatment}, explicamos as etapas com clareza e combinamos o melhor próximo passo sem pressão. Posso reservar uma avaliação para você tirar essas dúvidas com segurança?`,
    next_action: rule.action,
    conversion_chance: rule.category === 'Preço' ? 58 : rule.category === 'Medo' ? 64 : rule.category === 'Tempo' ? 61 : rule.category === 'Confiança' ? 67 : 52,
  };
  return response;
}

async function getKpis() {
  const [patients, contacts, converted, budgets, revenue, lost, campaigns, appointments, followups] = await Promise.all([
    get("SELECT COUNT(*) AS total FROM patients WHERE date(created_at) >= date('now','start of month')"),
    get('SELECT COUNT(*) AS total FROM crm_contacts'),
    get("SELECT COUNT(*) AS total FROM crm_contacts WHERE status IN ('Fechado','Fechada') OR pipeline_stage IN ('Fechado','Fechada')"),
    get("SELECT COUNT(*) AS total, COALESCE(AVG(total_amount),0) AS avg_ticket FROM budgets WHERE date(created_at) >= date('now','start of month')"),
    get("SELECT COALESCE(SUM(amount),0) AS total FROM financial_records WHERE type = 'receita' AND status IN ('pago','recebido','Pago','Recebido')"),
    get("SELECT COALESCE(SUM(estimated_value),0) AS total FROM crm_contacts WHERE status = 'Perdido' OR pipeline_stage = 'Perdido'"),
    all('SELECT id, name, channel, cost, budget, status FROM crm_campaigns ORDER BY updated_at DESC LIMIT 20'),
    get("SELECT COUNT(*) AS total FROM appointments WHERE date(appointment_date) >= date('now')"),
    get("SELECT COUNT(*) AS total FROM crm_followups WHERE status = 'Pendente' AND date(scheduled_date) <= date('now')"),
  ]);
  const roiBase = money(campaigns.reduce((sum, item) => sum + money(item.cost || item.budget), 0));
  const revenueTotal = money(revenue.total);
  return {
    new_patients: patients.total,
    leads: contacts.total,
    converted_leads: converted.total,
    conversion_rate: percent(converted.total, contacts.total),
    budgets: budgets.total,
    average_ticket: Math.round(money(budgets.avg_ticket)),
    revenue: revenueTotal,
    lost_revenue: money(lost.total),
    roi: roiBase ? Math.round(((revenueTotal - roiBase) / roiBase) * 1000) / 10 : 0,
    monthly_forecast: Math.round(revenueTotal * 1.18),
    annual_forecast: Math.round(revenueTotal * 12),
    future_appointments: appointments.total,
    pending_followups: followups.total,
  };
}

router.get('/workspace', async (req, res, next) => {
  try {
    const [kpis, content, memories] = await Promise.all([
      getKpis(),
      all('SELECT title, scheduled_date, format, category, hook, cta, hashtags FROM content_posts ORDER BY scheduled_date ASC LIMIT 30'),
      all('SELECT memory_type, title, summary, confidence, created_at FROM brain_memory ORDER BY created_at DESC LIMIT 10'),
    ]);
    const conversionRisk = kpis.conversion_rate < 20 ? 'Conversão abaixo de 20%: priorizar objeções e follow-up.' : 'Conversão saudável: repetir campanhas vencedoras.';
    res.json({
      date: today(),
      goal: { title: 'Meta do dia', target: 'Gerar conversas qualificadas e preencher horários vagos', expected_impact: 'Mais avaliações e maior previsibilidade de receita' },
      missions: [
        { title: 'Atacar follow-ups pendentes', time: '45 min', impact: 'recuperar leads parados', confidence: 86 },
        { title: 'Publicar conteúdo do dia', time: '30 min', impact: 'aumentar demanda orgânica', confidence: 78 },
        { title: 'Preencher agenda com WhatsApp ativo', time: '40 min', impact: 'reduzir horários vagos', confidence: 81 },
      ],
      kpis,
      strategy: { weekly_goal: 'Aumentar avaliações marcadas', plan: ['Priorizar leads quentes', 'Responder objeções', 'Publicar provas de autoridade', 'Medir ROI por campanha'], expected_result: 'Mais consultas com menor perda de receita' },
      predictive: { trend: kpis.leads > 0 ? 'Base com leads ativa' : 'Tendência de queda por falta de leads cadastrados', best_time: '18:30', seasonality: 'Reforçar estética antes de datas comemorativas' },
      analytics: { decision: conversionRisk, confidence: 82, data_used: ['CRM', 'Financeiro', 'Agenda', 'Conteúdo', 'Memória'], expected_impact: 'Priorizar tarefas com maior chance de conversão' },
      content_plan: content,
      memory: memories,
    });
  } catch (error) { next(error); }
});

router.post('/objections/analyze', async (req, res, next) => {
  try {
    const result = buildObjectionResponse(req.body || {});
    await run('INSERT INTO brain_memory (memory_type, title, summary, payload, confidence) VALUES (?, ?, ?, ?, ?)', ['objection', result.category, req.body.objection || '', JSON.stringify(result), result.conversion_chance]);
    await audit(req, 'create', 'brain:objection', result.category);
    res.status(201).json(result);
  } catch (error) { next(error); }
});

router.get('/library', async (req, res, next) => {
  try {
    const params = [];
    const where = [];
    if (req.query.search) { where.push('(title LIKE ? OR content LIKE ? OR category LIKE ?)'); params.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`); }
    if (req.query.category) { where.push('category = ?'); params.push(req.query.category); }
    const sql = `SELECT 'IA' AS source, title, category, content, cta, notes, updated_at FROM ai_reels ${where.length ? `WHERE ${where.join(' AND ')}` : ''} UNION ALL SELECT 'WhatsApp', title, category, message, NULL, NULL, updated_at FROM marketing_whatsapp_templates ORDER BY updated_at DESC LIMIT 100`;
    res.json(await all(sql, params));
  } catch (error) { next(error); }
});

module.exports = router;

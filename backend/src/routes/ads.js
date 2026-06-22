const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');

const router = express.Router();

const resources = {
  campaigns: { table: 'ads_campaigns', order: 'updated_at DESC, id DESC', fields: ['name','platform','objective','status','budget','spent','start_date','end_date','target_audience','notes'] },
  platforms: { table: 'ads_platforms', order: 'name ASC', fields: ['name','type','status','official_api','oauth_scopes','notes'] },
  leads: { table: 'ads_leads', order: 'created_at DESC, id DESC', fields: ['name','phone','email','source','platform','campaign_id','interest','status','scheduled_consultation','closed_treatment','revenue','notes'] },
  metrics: { table: 'ads_metrics', order: 'metric_date DESC, id DESC', fields: ['campaign_id','platform','metric_date','impressions','reach','clicks','leads','cost_per_lead','scheduled_consultations','closed_treatments','revenue_generated','roi','conversion_rate'] },
};

function pick(body, fields) { return Object.fromEntries(fields.map((field) => [field, body[field] ?? null])); }

async function list(resource, req, res) {
  const config = resources[resource];
  if (!config) return res.status(404).json({ error: 'Recurso de tráfego não encontrado.' });
  res.json(await all(`SELECT * FROM ${config.table} ORDER BY ${config.order}`));
}

async function create(resource, req, res) {
  const config = resources[resource];
  if (!config) return res.status(404).json({ error: 'Recurso de tráfego não encontrado.' });
  const data = pick(req.body, config.fields);
  const fields = Object.keys(data);
  const result = await run(`INSERT INTO ${config.table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, Object.values(data));
  await audit(req, 'create', `ads:${resource}`, `Registro ${result.id}`);
  res.status(201).json(await get(`SELECT * FROM ${config.table} WHERE id = ?`, [result.id]));
}

router.get('/dashboard', async (req, res, next) => {
  try {
    const month = new Date().toISOString().slice(0, 7);
    const totals = await get(`SELECT COALESCE(SUM(spent), 0) AS investment FROM ads_campaigns WHERE substr(COALESCE(start_date, created_at), 1, 7) <= ?`, [month]);
    const metrics = await get(`SELECT COALESCE(SUM(leads), 0) AS leads, COALESCE(SUM(revenue_generated), 0) AS revenue, COALESCE(SUM(scheduled_consultations), 0) AS scheduled, COALESCE(SUM(closed_treatments), 0) AS closed FROM ads_metrics WHERE substr(metric_date, 1, 7) = ?`, [month]);
    const spent = totals.investment || 0;
    const leads = metrics.leads || 0;
    const ranking = await all(`SELECT c.id, c.name, c.platform, c.spent, COALESCE(SUM(m.leads), 0) AS leads, COALESCE(SUM(m.revenue_generated), 0) AS revenue, CASE WHEN c.spent > 0 THEN ROUND(((COALESCE(SUM(m.revenue_generated), 0) - c.spent) / c.spent) * 100, 2) ELSE 0 END AS roi FROM ads_campaigns c LEFT JOIN ads_metrics m ON m.campaign_id = c.id GROUP BY c.id ORDER BY roi DESC, revenue DESC, leads DESC`);
    const platform = await get(`SELECT platform, COALESCE(SUM(leads), 0) AS leads, COALESCE(SUM(revenue_generated), 0) AS revenue FROM ads_metrics GROUP BY platform ORDER BY revenue DESC, leads DESC LIMIT 1`);
    res.json({ investment_month: spent, leads_generated: leads, cost_per_lead: leads ? Math.round((spent / leads) * 100) / 100 : 0, predicted_revenue: metrics.revenue || 0, roi: spent ? Math.round((((metrics.revenue || 0) - spent) / spent) * 10000) / 100 : 0, scheduled_consultations: metrics.scheduled || 0, closed_treatments: metrics.closed || 0, best_campaign: ranking[0] || null, best_platform: platform || null, campaign_ranking: ranking });
  } catch (error) { next(error); }
});

Object.keys(resources).forEach((resource) => {
  router.get(`/${resource}`, (req, res, next) => list(resource, req, res).catch(next));
  router.post(`/${resource}`, (req, res, next) => create(resource, req, res).catch(next));
});

module.exports = router;

const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');
const router = express.Router();

const resources = {
  integrations: { table: 'social_integrations', order: 'platform ASC', fields: ['platform','provider','status','oauth_authorize_url','oauth_scopes','webhook_url','notes'] },
  accounts: { table: 'social_accounts', order: 'platform ASC, account_name ASC', fields: ['integration_id','platform','account_name','account_external_id','status','permissions','notes'] },
  tokens: { table: 'social_tokens', order: 'created_at DESC', fields: ['integration_id','account_id','token_type','access_token','refresh_token','expires_at','scopes','status'] },
  posts: { table: 'social_posts', order: 'scheduled_at DESC, id DESC', fields: ['account_id','platform','title','content','media_url','status','scheduled_at','published_at','external_post_id','notes'] },
  metrics: { table: 'social_post_metrics', order: 'metric_date DESC, id DESC', fields: ['post_id','platform','metric_date','impressions','reach','clicks','likes','comments','shares','saves','leads'] },
  webhooks: { table: 'social_webhooks', order: 'created_at DESC', fields: ['integration_id','platform','event_type','callback_url','verify_token_hint','status','last_payload','last_received_at'] },
};
function pick(body, fields) { return Object.fromEntries(fields.map((field) => [field, body[field] ?? null])); }
async function list(resource, res) { const c = resources[resource]; res.json(await all(`SELECT * FROM ${c.table} ORDER BY ${c.order}`)); }
async function create(resource, req, res) { const c = resources[resource]; const data = pick(req.body, c.fields); const fields = Object.keys(data); const result = await run(`INSERT INTO ${c.table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, Object.values(data)); await audit(req, 'create', `social:${resource}`, `Registro ${result.id}`); res.status(201).json(await get(`SELECT * FROM ${c.table} WHERE id = ?`, [result.id])); }
router.get('/connect/:platform', async (req, res) => { const platform = req.params.platform; const row = await get('SELECT * FROM social_integrations WHERE lower(platform) = lower(?)', [platform]); res.json({ platform, status: row?.status || 'Não configurado', oauth_ready: true, message: `Conexão ${platform} preparada para OAuth oficial. Cadastre app_id, app_secret, escopos e redirect_uri em Configurações de API.` }); });
Object.keys(resources).forEach((resource) => { router.get(`/${resource}`, (req, res, next) => list(resource, res).catch(next)); router.post(`/${resource}`, (req, res, next) => create(resource, req, res).catch(next)); });
module.exports = router;

#!/usr/bin/env node
const http = require('http');
const app = require('../src/app');
const initializeDatabase = require('../src/database/schema');
const { db } = require('../src/database/connection');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@belleart.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const routes = [
  '/api/health','/api/dashboard','/api/patients','/api/appointments','/api/budgets','/api/financial',
  '/api/marketing-ai/summary','/api/content/dashboard','/api/whatsapp/dashboard','/api/ads/dashboard',
  '/api/premium-os/dashboard','/api/enterprise/dashboard','/api/enterprise-crm/dashboard','/api/clinical/dashboard',
  '/api/secretary/dashboard','/api/ai/agents','/api/automations/dashboard','/api/backup/jobs',
];

function listen(server) { return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port))); }
function close(server) { return new Promise((resolve) => server.close(resolve)); }
function closeDb() { return new Promise((resolve) => db.close(() => resolve())); }
function isHtml(text, contentType) { return /text\/html/i.test(contentType || '') || /^\s*</.test(text || ''); }

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let body = text;
  try { body = text ? JSON.parse(text) : null; } catch {}
  return { path, status: response.status, contentType: response.headers.get('content-type') || '', text, body };
}

async function main() {
  console.log('BELLEART OS — validação automática completa');
  console.log('Inicializando/verificando SQLite sem apagar dados...');
  await initializeDatabase();
  const server = http.createServer(app);
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}`;
  const results = [];
  let exitCode = 0;

  try {
    const login = await request(baseUrl, '/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (login.status !== 200 || !login.body?.token) throw new Error(`Login admin falhou (${login.status}).`);
    const token = login.body.token;
    console.log(`Login admin OK: ${ADMIN_EMAIL}`);

    for (const route of routes) {
      const options = route === '/api/health' ? {} : { headers: { Authorization: `Bearer ${token}` } };
      const result = await request(baseUrl, route, options);
      const ok = result.status >= 200 && result.status < 300 && result.status !== 204 && !isHtml(result.text, result.contentType);
      if (!ok || result.status >= 500) exitCode = 1;
      results.push({ route, status: result.status, ok, html: isHtml(result.text, result.contentType), error: result.body?.error || '' });
    }
  } finally {
    await close(server);
    await closeDb();
  }

  console.table(results);
  const failed = results.filter((item) => !item.ok || item.status >= 500);
  if (failed.length) {
    console.error(`Falhas encontradas: ${failed.length}`);
    process.exit(exitCode || 1);
  }
  console.log(`Validação concluída: ${results.length} rotas principais OK, sem HTML indevido e sem erro 500.`);
}

main().catch(async (error) => { console.error(error); try { await closeDb(); } catch {} process.exit(1); });

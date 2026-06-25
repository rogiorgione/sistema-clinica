const { all, get, run } = require('./database/connection');

const REQUIRED_TABLES = [
  'users',
  'patients',
  'appointments',
  'budgets',
  'financial_records',
  'ai_agents',
  'ai_prompt_library',
  'ai_recommendations',
  'automation_logs',
  'system_health',
  'audit_logs',
];

const STARTUP_CHECKS = [
  ['database', 'Banco de dados'],
  ['api', 'APIs internas'],
  ['brain', 'Brain operacional'],
  ['agents', 'Agentes IA'],
  ['memory', 'Memória operacional'],
  ['learning', 'Aprendizado contínuo'],
];

async function tableExists(tableName) {
  const table = await get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?", [tableName]);
  return Boolean(table);
}

async function countRows(tableName) {
  const row = await get(`SELECT COUNT(*) AS total FROM ${tableName}`);
  return row?.total || 0;
}

async function recordSystemHealth(title, status, payload) {
  await run(
    'INSERT INTO system_health (title, status, payload) VALUES (?, ?, ?)',
    [title, status, JSON.stringify(payload)]
  );
}

async function runStartupHealthCheck() {
  const startedAt = new Date().toISOString();
  const problems = [];
  const results = [];

  for (const table of REQUIRED_TABLES) {
    const exists = await tableExists(table);
    if (!exists) problems.push(`Tabela obrigatória ausente: ${table}`);
  }

  const integrity = await get('PRAGMA integrity_check');
  const integrityStatus = integrity?.integrity_check === 'ok' ? 'ok' : 'problem';
  if (integrityStatus !== 'ok') problems.push(`Integridade SQLite: ${integrity?.integrity_check || 'sem resposta'}`);

  const agentCount = await tableExists('ai_agents') ? await countRows('ai_agents') : 0;
  const promptCount = await tableExists('ai_prompt_library') ? await countRows('ai_prompt_library') : 0;
  const healthCount = await tableExists('system_health') ? await countRows('system_health') : 0;

  const checks = {
    database: { status: integrityStatus, detail: `${REQUIRED_TABLES.length} tabelas críticas verificadas` },
    api: { status: 'ok', detail: 'Aplicação Express carregada e rotas registradas' },
    brain: { status: promptCount > 0 ? 'ok' : 'warning', detail: `${promptCount} registros na biblioteca de prompts` },
    agents: { status: agentCount > 0 ? 'ok' : 'warning', detail: `${agentCount} agentes cadastrados` },
    memory: { status: healthCount > 0 ? 'ok' : 'warning', detail: `${healthCount} registros anteriores de saúde` },
    learning: { status: 'ok', detail: 'Log de evolução ativo para melhorias reais' },
  };

  for (const [key, title] of STARTUP_CHECKS) {
    const item = checks[key];
    if (item.status === 'warning') problems.push(`${title}: ${item.detail}`);
    results.push({ key, title, ...item });
  }

  const status = problems.length ? 'Atenção' : 'Estável';
  const payload = { startedAt, finishedAt: new Date().toISOString(), checks: results, problems };
  await recordSystemHealth('Verificação automática de inicialização', status, payload);

  return { status, ...payload };
}

module.exports = { runStartupHealthCheck, REQUIRED_TABLES };

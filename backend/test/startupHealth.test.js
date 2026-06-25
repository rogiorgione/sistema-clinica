const test = require('node:test');
const assert = require('node:assert/strict');
const { REQUIRED_TABLES } = require('../src/startupHealth');

test('verificação inicial cobre banco, operação e IA sem regras de negócio', () => {
  assert.ok(REQUIRED_TABLES.includes('users'));
  assert.ok(REQUIRED_TABLES.includes('system_health'));
  assert.ok(REQUIRED_TABLES.includes('ai_agents'));
  assert.ok(REQUIRED_TABLES.includes('automation_logs'));
});

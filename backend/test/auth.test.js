const test = require('node:test'); const assert = require('node:assert/strict');
const { hashPassword, verifyPassword, can } = require('../src/auth');
test('hash de senha valida somente a senha correta', () => { const hash = hashPassword('segredo'); assert.equal(verifyPassword('segredo', hash), true); assert.equal(verifyPassword('outra', hash), false); });
test('perfis respeitam escrita e somente leitura', () => { assert.equal(can({ role: 'administrador' }, 'users', true), true); assert.equal(can({ role: 'leitura' }, 'patients', false), true); assert.equal(can({ role: 'leitura' }, 'patients', true), false); assert.equal(can({ role: 'recepcao' }, 'financial', false), false); });

const crypto = require('crypto');
const { get, run } = require('./database/connection');

const SECRET = process.env.AUTH_SECRET || 'belleart-local-change-me';
const ROLE_PERMISSIONS = {
  administrador: ['*'],
  dentista: ['dashboard', 'patients', 'appointments', 'budgets', 'documents', 'implants', 'financial:read', 'profile'],
  recepcao: ['dashboard', 'patients', 'appointments', 'whatsapp', 'tasks', 'notifications', 'profile'],
  financeiro: ['dashboard', 'financial', 'implant-financial', 'reports', 'documents', 'installments', 'profile'],
  marketing: ['dashboard', 'marketing', 'campaigns', 'crm', 'whatsapp', 'captions', 'content-calendar', 'ai-assistant', 'reels', 'executive', 'tasks', 'profile'],
  leitura: ['*:read', 'profile'],
};

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `${salt}:${crypto.scryptSync(String(password), salt, 64).toString('hex')}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), crypto.scryptSync(String(password), salt, 64));
}
function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}
function parse(token) {
  const [data, signature] = String(token || '').split('.');
  if (!data || !signature) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
  return payload.exp > Date.now() ? payload : null;
}
async function authenticate(request, response, next) {
  try {
    const payload = parse((request.headers.authorization || '').replace(/^Bearer\s+/i, ''));
    if (!payload) return response.status(401).json({ error: 'Autenticação necessária.' });
    const user = await get('SELECT id, name, email, role, active FROM users WHERE id = ?', [payload.id]);
    if (!user || !user.active) return response.status(401).json({ error: 'Usuário inválido ou inativo.' });
    request.user = user;
    next();
  } catch (error) { next(error); }
}
function can(user, module, write = false) {
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  if (permissions.includes('*')) return true;
  if (write && user.role === 'leitura') return false;
  return permissions.includes(module) || (!write && (permissions.includes(`${module}:read`) || permissions.includes('*:read')));
}
function authorize(module) {
  return (request, response, next) => can(request.user, module, request.method !== 'GET')
    ? next() : response.status(403).json({ error: 'Acesso não permitido para este perfil.' });
}
async function audit(request, action, module, details = '') {
  await run('INSERT INTO audit_logs (user_id, action, module, details, ip) VALUES (?, ?, ?, ?, ?)', [request.user?.id || null, action, module, details, request.ip || '']);
}
module.exports = { ROLE_PERMISSIONS, hashPassword, verifyPassword, sign, authenticate, authorize, can, audit };

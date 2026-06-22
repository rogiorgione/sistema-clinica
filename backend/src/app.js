const express = require('express');
const cors = require('cors');
const { authenticate, authorize, audit } = require('./auth');
const createModuleRouter = require('./routes/modules');
const app = express();
app.use(cors()); app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok', product: 'BELLEART OS' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api', authenticate);
app.use((req, res, next) => { if (req.method === 'GET') return next(); res.on('finish', () => { if (res.statusCode < 400) audit(req, req.method.toLowerCase(), req.path.split('/')[1] || 'api').catch(console.error); }); next(); });
const legacy = [
  ['/dashboard', 'dashboard', './routes/dashboard'], ['/patients', 'patients', './routes/patients'],
  ['/appointments', 'appointments', './routes/appointments'], ['/budgets', 'budgets', './routes/budgets'],
  ['/financial', 'financial', './routes/financial'],
];
legacy.forEach(([path, permission, route]) => app.use(`/api${path}`, authorize(permission), require(route)));
const modules = {
  marketing: 'marketing', 'lead-capture': 'marketing', campaigns: 'campaigns', crm: 'crm', 'implant-crm': 'implants',
  'implant-financial': 'implant-financial', whatsapp: 'whatsapp', tasks: 'tasks', captions: 'captions',
  'content-calendar': 'content-calendar', 'ai-assistant': 'ai-assistant', reels: 'reels', executive: 'executive',
  documents: 'documents', notifications: 'notifications', referrals: 'patients', reactivation: 'marketing',
  reports: 'reports', automations: 'marketing', settings: 'profile', backups: 'users', profile: 'profile', installments: 'installments', stories: 'content-calendar', metrics: 'marketing',
};
Object.entries(modules).forEach(([path, permission]) => app.use(`/api/${path}`, authorize(permission), createModuleRouter(path)));
app.use('/api/implants/dashboard', authorize('implants'), createModuleRouter('implant-crm'));
app.use('/api/reports/summary', authorize('reports'), (req, res) => res.json({ status: 'ok', generatedAt: new Date().toISOString() }));
app.use('/api/marketing-ai', authorize('marketing'), require('./routes/marketingAi'));
app.use('/api/ads', authorize('marketing'), require('./routes/ads'));
app.use('/api/social', authorize('marketing'), require('./routes/social'));
app.use('/api/api-credentials', authorize('marketing'), require('./routes/apiCredentials'));
app.use('/api/crm', authorize('crm'), require('./routes/crm'));
app.use('/api/ai', authorize('ai-assistant'), require('./routes/ai'));
app.use('/api/content', authorize('content-calendar'), require('./routes/content'));
app.use('/api/premium-os', authorize('executive'), require('./routes/premiumOs'));
app.use('/api/users', authorize('users'), require('./routes/users'));
app.use('/api/audit', authorize('users'), require('./routes/audit'));
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
app.use((error, req, res, next) => { console.error(error); res.status(500).json({ error: 'Erro interno no servidor.' }); });
module.exports = app;

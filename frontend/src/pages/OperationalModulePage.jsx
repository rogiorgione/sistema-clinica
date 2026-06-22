import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const moduleDetails = {
  notifications: { icon: '🔔', description: 'Alertas operacionais, retornos e avisos internos.', fields: ['title', 'status', 'priority', 'owner', 'dueDate', 'notes'] },
  documents: { icon: '📄', description: 'Documentos clínicos e administrativos com rastreabilidade.', fields: ['title', 'status', 'category', 'owner', 'dueDate', 'notes'] },
  'implant-crm': { icon: '🦷', description: 'Pipeline de implantes, avaliações e fechamento de tratamentos.', fields: ['title', 'status', 'stage', 'owner', 'dueDate', 'notes'] },
  referrals: { icon: '🤝', description: 'Indicações recebidas, origem e acompanhamento comercial.', fields: ['title', 'status', 'source', 'owner', 'dueDate', 'notes'] },
  reactivation: { icon: '♻️', description: 'Campanhas de retorno para pacientes inativos.', fields: ['title', 'status', 'campaign', 'owner', 'dueDate', 'notes'] },
  campaigns: { icon: '🎯', description: 'Campanhas de marketing, status e responsáveis.', fields: ['title', 'status', 'channel', 'owner', 'dueDate', 'notes'] },
  'implant-financial': { icon: '💎', description: 'Acompanhamento financeiro específico de tratamentos de implante.', fields: ['title', 'status', 'amount', 'owner', 'dueDate', 'notes'] },
  reports: { icon: '📊', description: 'Relatórios gerenciais, indicadores e fechamento mensal.', fields: ['title', 'status', 'category', 'owner', 'dueDate', 'notes'] },
  automations: { icon: '⚙️', description: 'Automações seguras para rotinas da clínica.', fields: ['title', 'status', 'trigger', 'owner', 'dueDate', 'notes'] },
  settings: { icon: '🛠️', description: 'Parâmetros do sistema e preferências operacionais.', fields: ['title', 'status', 'category', 'owner', 'dueDate', 'notes'] },
  backups: { icon: '🗄️', description: 'Controles de backup e gestão segura do ambiente.', fields: ['title', 'status', 'category', 'owner', 'dueDate', 'notes'] },
  profile: { icon: '👤', description: 'Preferências e dados do perfil conectado.', fields: ['title', 'status', 'category', 'owner', 'dueDate', 'notes'] },
  users: { icon: '👥', description: 'Gestão de usuários e perfis de acesso.', fields: ['name', 'email', 'role', 'active'] },
  audit: { icon: '🧾', description: 'Histórico de ações sensíveis realizadas no sistema.', fields: [] },
};

const labels = { title: 'Título', status: 'Status', priority: 'Prioridade', owner: 'Responsável', dueDate: 'Prazo', notes: 'Observações', category: 'Categoria', stage: 'Etapa', source: 'Origem', campaign: 'Campanha', channel: 'Canal', amount: 'Valor', trigger: 'Gatilho', name: 'Nome', email: 'E-mail', role: 'Perfil', active: 'Ativo' };
const defaultStatuses = ['ativo', 'pendente', 'em andamento', 'concluído'];

function emptyForm(fields) { return Object.fromEntries(fields.map((field) => [field, field === 'dueDate' ? new Date().toISOString().slice(0, 10) : ''])); }
function parseContent(item) { try { return JSON.parse(item.content || '{}'); } catch { return {}; } }

export default function OperationalModulePage({ title, path, readOnly = false }) {
  const config = moduleDetails[path] || { icon: '✨', description: 'Módulo operacional integrado ao BELLEART OS.', fields: ['title', 'status', 'category', 'owner', 'dueDate', 'notes'] };
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(() => emptyForm(config.fields));
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setMessage('');
    try { setItems(await api.get(`/${path}`)); }
    catch (error) { setMessage(error.message || 'Não foi possível carregar o módulo.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { setForm(emptyForm(config.fields)); load(); }, [path]);

  const visibleItems = useMemo(() => items.filter((item) => {
    const content = parseContent(item);
    const haystack = JSON.stringify({ ...item, ...content }).toLowerCase();
    return (!filter || haystack.includes(filter.toLowerCase())) && (!status || item.status === status || content.status === status);
  }), [items, filter, status]);

  const stats = useMemo(() => ({ total: items.length, active: items.filter((i) => i.status === 'ativo').length, pending: items.filter((i) => /pendente|andamento/i.test(i.status)).length }), [items]);

  async function submit(event) {
    event.preventDefault();
    const payloadTitle = form.title || form.name || `${title} - ${new Date().toLocaleDateString('pt-BR')}`;
    try {
      await api.post(`/${path}`, { title: payloadTitle, status: form.status || 'ativo', content: form });
      setForm(emptyForm(config.fields));
      setMessage('Registro salvo com segurança.');
      await load();
    } catch (error) { setMessage(error.message || 'Falha ao salvar.'); }
  }

  return <section className="operational-page">
    <div className="page-header premium-header"><div><span className="eyebrow">{config.icon} BELLEART OS</span><h2>{title}</h2><p>{config.description}</p></div><span className="badge">Módulo revisado</span></div>
    <div className="metrics-grid"><article className="metric-card"><span>Total</span><strong>{stats.total}</strong></article><article className="metric-card"><span>Ativos</span><strong>{stats.active}</strong></article><article className="metric-card"><span>Pendências</span><strong>{stats.pending}</strong></article></div>
    {message && <p className={message.includes('salvo') ? 'alert success' : 'alert error'}>{message}</p>}
    <div className="search-card filters"><label>Buscar<input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar registros" /></label><label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option>{defaultStatuses.map((s) => <option key={s}>{s}</option>)}</select></label></div>
    {!readOnly && config.fields.length > 0 && <form className="form-grid" onSubmit={submit}>{config.fields.map((field) => <label className={field === 'notes' ? 'full' : ''} key={field}>{labels[field] || field}{field === 'notes' ? <textarea value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /> : field === 'status' ? <select value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })}>{defaultStatuses.map((s) => <option key={s}>{s}</option>)}</select> : <input type={field === 'dueDate' ? 'date' : field === 'amount' ? 'number' : 'text'} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={['title','name','email'].includes(field)} />}</label>)}<div className="full form-actions"><button type="submit">Salvar registro</button></div></form>}
    {loading ? <article className="card empty-state">Carregando dados do módulo...</article> : <div className="table-wrapper"><table><thead><tr><th>Registro</th><th>Status</th><th>Detalhes</th><th>Atualização</th></tr></thead><tbody>{visibleItems.length ? visibleItems.map((item) => { const content = parseContent(item); return <tr key={item.id}><td><strong className="record-title">{item.title || item.name || item.email}</strong></td><td><span className="badge">{item.status || content.status || (item.active ? 'ativo' : 'inativo')}</span></td><td>{Object.entries(content).filter(([,v]) => v).slice(0, 4).map(([k,v]) => <p key={k}><b>{labels[k] || k}:</b> {String(v)}</p>)}</td><td>{item.updated_at || item.created_at ? new Date(item.updated_at || item.created_at).toLocaleString('pt-BR') : '-'}</td></tr>; }) : <tr><td colSpan="4" className="empty-state">Nenhum registro encontrado. O módulo está pronto para uso.</td></tr>}</tbody></table></div>}
  </section>;
}

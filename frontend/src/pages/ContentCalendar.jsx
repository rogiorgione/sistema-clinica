import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const categories = ['Implantes', 'Prótese Protocolo', 'Ortodontia', 'Botox', 'Preenchimento', 'Harmonização Facial', 'Clareamento', 'Próteses', 'Limpeza', 'Bastidores', 'Autoridade', 'Depoimentos'];
const formats = ['Reels', 'Stories', 'Carrosséis'];
const statuses = ['Pendente', 'Agendado', 'Publicado'];
const tabs = [
  ['calendar', 'Calendário de Conteúdo'],
  ['ideas', 'Ideias'],
  ['posts', 'Biblioteca'],
  ['stories', 'Stories'],
  ['dashboard', 'Métricas'],
];

function today() { return new Date().toISOString().slice(0, 10); }
function currentMonth() { return today().slice(0, 7); }

export default function ContentCalendar({ readOnly = false }) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [items, setItems] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [filters, setFilters] = useState({ day: '', week: '', month: currentMonth(), category: '', format: '', status: '' });
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ title: '', scheduled_date: today(), week: 'Semana 1', month: currentMonth(), platform: 'Instagram', format: 'Reels', category: 'Implantes', status: 'Pendente', hook: '', script: '', caption: '', cta: 'Agendar avaliação pelo WhatsApp.', hashtags: '#BELLEART #Odontologia', duration_seconds: 35, integration_target: 'Instagram' });
  const query = useMemo(() => new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value))).toString(), [filters]);

  async function load() {
    const metrics = await api.get('/content/dashboard');
    setDashboard(metrics);
    if (activeTab === 'dashboard') { setItems([]); return; }
    const path = activeTab === 'calendar' ? '/content/calendar' : activeTab === 'ideas' ? '/content/ideas' : activeTab === 'stories' ? '/content/stories' : '/content/posts';
    setItems(await api.get(`${path}${query ? `?${query}` : ''}`));
  }

  useEffect(() => { load().catch((error) => setMessage(error.message)); }, [activeTab, query]);

  async function submit(event) {
    event.preventDefault();
    await api.post('/content/posts', form);
    setMessage('Post criado na biblioteca sem alterar pacientes ou dados existentes.');
    await load();
  }

  function updateFilter(field, value) { setFilters((current) => ({ ...current, [field]: value })); }
  function updateForm(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  return <section>
    <div className="page-header"><div><h2>Calendário Inteligente de Conteúdo</h2><p>365 ideias de Reels, 365 de Stories e 365 de Carrosséis para Instagram, TikTok, Facebook e WhatsApp.</p></div><span className="badge">Fase 5</span></div>
    {message && <p className="alert success">{message}</p>}
    <div className="metrics-grid">
      <article className="metric-card"><span>Posts planejados</span><strong>{dashboard?.planned_posts ?? 0}</strong></article>
      <article className="metric-card"><span>Posts publicados</span><strong>{dashboard?.published_posts ?? 0}</strong></article>
      {(dashboard?.by_format || formats.map((format) => ({ format, total: 0 }))).map((item) => <article className="metric-card" key={item.format}><span>{item.format}</span><strong>{item.total}</strong></article>)}
    </div>
    <div className="tab-bar">{tabs.map(([key, label]) => <button className={activeTab === key ? 'active' : 'secondary'} type="button" key={key} onClick={() => setActiveTab(key)}>{label}</button>)}</div>
    <div className="search-card filters">
      <label>Dia<input type="date" value={filters.day} onChange={(e) => updateFilter('day', e.target.value)} /></label>
      <label>Semana<input value={filters.week} onChange={(e) => updateFilter('week', e.target.value)} placeholder="Semana 1" /></label>
      <label>Mês<input type="month" value={filters.month} onChange={(e) => updateFilter('month', e.target.value)} /></label>
      <label>Categoria<select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}><option value="">Todas</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label>Formato<select value={filters.format} onChange={(e) => updateFilter('format', e.target.value)}><option value="">Todos</option>{formats.map((format) => <option key={format}>{format}</option>)}</select></label>
      <label>Status<select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}><option value="">Todos</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
    </div>
    {activeTab === 'posts' && !readOnly && <form className="form-grid" onSubmit={submit}><h3 className="full">Criar post planejado</h3>{['title','scheduled_date','week','month','platform','format','category','status','hook','script','caption','cta','hashtags','duration_seconds','integration_target'].map((field) => <label className={['script','caption'].includes(field) ? 'full' : ''} key={field}>{field}{['script','caption'].includes(field) ? <textarea value={form[field]} onChange={(e) => updateForm(field, e.target.value)} required /> : <input type={field === 'scheduled_date' ? 'date' : field === 'month' ? 'month' : field === 'duration_seconds' ? 'number' : 'text'} value={form[field]} onChange={(e) => updateForm(field, e.target.value)} required={['title','scheduled_date','category','hook'].includes(field)} list={`${field}-options`} />}{field === 'category' && <datalist id="category-options">{categories.map((option) => <option key={option} value={option} />)}</datalist>}{field === 'format' && <datalist id="format-options">{formats.map((option) => <option key={option} value={option} />)}</datalist>}{field === 'status' && <datalist id="status-options">{statuses.map((option) => <option key={option} value={option} />)}</datalist>}</label>)}<div className="full form-actions"><button type="submit">Adicionar post</button></div></form>}
    {activeTab === 'dashboard' ? <div className="capture-grid"><article className="card"><span>Conteúdos por categoria</span>{dashboard?.by_category?.map((item) => <p key={item.category}><b>{item.category}:</b> {item.total}</p>)}</article><article className="card"><span>Status</span>{dashboard?.by_status?.map((item) => <p key={item.status}><b>{item.status}:</b> {item.total}</p>)}</article><article className="card"><span>Integrações preparadas</span>{dashboard?.future_integrations?.map((item) => <p key={item}>• {item}</p>)}</article></div> : <div className="marketing-list">{items.map((item) => <article className="card marketing-card" key={`${activeTab}-${item.id}`}><div><span>{item.format} • {item.category}</span><strong className="record-title">{item.title || `${item.platform} em ${item.scheduled_date || `Dia ${item.day_number}`}`}</strong></div>{['scheduled_date','week','month','platform','status','hook','script','caption','cta','hashtags','duration_seconds','theme'].map((field) => item[field] ? <p key={field}><b>{field}:</b> {item[field]}</p> : null)}</article>)}{!items.length && <article className="card empty-state">Nenhum conteúdo encontrado.</article>}</div>}
  </section>;
}

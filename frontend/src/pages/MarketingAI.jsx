import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const resources = {
  calendar: { title: 'Calendário de Conteúdo', description: 'Planejamento mensal e semanal com status Pendente, Agendado e Publicado.', fields: ['title','publish_date','week','channel','content_type','category','status','caption','cta','hashtags'], categories: ['Implantes','Prótese Protocolo','Ortodontia','Botox','Harmonização','Clareamento'], status: ['Pendente','Agendado','Publicado'] },
  captions: { title: 'Banco de Legendas', description: 'Legendas com busca, filtros, CTA, hashtags e botão de copiar.', fields: ['title','category','caption','cta','hashtags'], categories: ['Implantes','Prótese Protocolo','Ortodontia','Botox','Harmonização','Clareamento'] },
  reels: { title: 'Biblioteca de Reels', description: 'Roteiros com gancho, CTA, duração e categoria.', fields: ['title','category','hook','script','cta','duration_seconds'], categories: ['Implantes','Prótese Protocolo','Ortodontia','Botox','Harmonização','Clareamento'] },
  stories: { title: 'Banco de Stories', description: 'Ideias separadas por Bastidores, Promoções, Autoridade e Depoimentos.', fields: ['title','category','script','cta'], categories: ['Bastidores','Promoções','Autoridade','Depoimentos'] },
  metrics: { title: 'Painel de Métricas', description: 'Estrutura para Instagram, TikTok, Facebook e WhatsApp.', fields: ['platform','metric_date','reach','views','followers','likes','shares'], categories: ['Instagram','TikTok','Facebook','WhatsApp'] },
  crm: { title: 'CRM Comercial', description: 'Funil de vendas: Novo Lead, Interessado, Avaliação Marcada, Negociação, Fechado e Perdido.', fields: ['name','phone','source','interest','stage','next_contact_date','notes'], status: ['Novo Lead','Interessado','Avaliação Marcada','Negociação','Fechado','Perdido'] },
  agenda: { title: 'Agenda Comercial', description: 'Próximos contatos e retornos comerciais.', fields: ['lead_name','contact_date','contact_time','channel','reason','status','notes'], status: ['Pendente','Realizado','Remarcar'] },
  whatsapp: { title: 'WhatsApp Inteligente', description: 'Mensagens automáticas por tratamento e relacionamento.', fields: ['title','category','message'], categories: ['Implantes','Ortodontia','Prótese','Reativação','Pós-operatório'] },
};

const labels = { title:'Título', publish_date:'Data', week:'Semana', channel:'Canal', content_type:'Formato', category:'Categoria', status:'Status', caption:'Legenda', cta:'CTA', hashtags:'Hashtags', hook:'Gancho', script:'Roteiro', duration_seconds:'Duração (seg)', platform:'Plataforma', metric_date:'Data', reach:'Alcance', views:'Visualizações', followers:'Seguidores', likes:'Curtidas', shares:'Compartilhamentos', name:'Lead', phone:'WhatsApp', source:'Origem', interest:'Interesse', stage:'Etapa', next_contact_date:'Próximo contato', lead_name:'Lead', contact_date:'Data', contact_time:'Hora', reason:'Motivo', message:'Mensagem' };
const textAreas = new Set(['caption','script','message','notes']);

function blank(config) { return Object.fromEntries(config.fields.map((field) => [field, field.includes('date') ? new Date().toISOString().slice(0, 10) : ''])); }

export default function MarketingAI({ resource = 'calendar', readOnly = false }) {
  const config = resources[resource] || resources.calendar;
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [form, setForm] = useState(() => blank(config));
  const [summary, setSummary] = useState({});
  const [message, setMessage] = useState('');

  const query = useMemo(() => new URLSearchParams({ ...(search ? { search } : {}), ...(category ? { category } : {}) }).toString(), [search, category]);
  async function load() { setItems(await api.get(`/marketing-ai/${resource}${query ? `?${query}` : ''}`)); setSummary(await api.get('/marketing-ai/summary')); }
  useEffect(() => { setForm(blank(config)); setCategory(''); setSearch(''); }, [resource]);
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, [resource, query]);

  async function submit(event) { event.preventDefault(); await api.post(`/marketing-ai/${resource}`, form); setForm(blank(config)); setMessage('Registro criado com sucesso.'); await load(); }
  async function copy(text) { await navigator.clipboard.writeText(text || ''); setMessage('Texto copiado.'); }
  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  return <section>
    <div className="page-header"><div><h2>{config.title}</h2><p>{config.description}</p></div><span className="badge">{items.length} itens</span></div>
    <div className="metrics-grid">
      {Object.entries({ calendar:'Calendário', captions:'Legendas', reels:'Reels', stories:'Stories', metrics:'Métricas', crm:'Leads', agenda:'Contatos', whatsapp:'WhatsApp' }).map(([key, label]) => <article className="metric-card" key={key}><span>{label}</span><strong>{summary[key] ?? 0}</strong></article>)}
    </div>
    {message && <p className="alert success">{message}</p>}
    <div className="search-card filters"><label>Buscar<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por texto" /></label>{config.categories && <label>Filtrar categoria<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Todas</option>{config.categories.map((option) => <option key={option}>{option}</option>)}</select></label>}</div>
    {!readOnly && <form className="form-grid" onSubmit={submit}>{config.fields.map((field) => <label className={textAreas.has(field) ? 'full' : ''} key={field}>{labels[field] || field}{textAreas.has(field) ? <textarea value={form[field] || ''} onChange={(e) => update(field, e.target.value)} required={['caption','script','message'].includes(field)} /> : <input type={field.includes('date') ? 'date' : field.includes('time') ? 'time' : field.includes('seconds') || ['reach','views','followers','likes','shares'].includes(field) ? 'number' : 'text'} value={form[field] || ''} onChange={(e) => update(field, e.target.value)} list={`${resource}-${field}`} required={['title','category','platform','name','lead_name'].includes(field)} />}{(field === 'category' && config.categories) && <datalist id={`${resource}-${field}`}>{config.categories.map((option) => <option key={option} value={option} />)}</datalist>}{(['status','stage'].includes(field) && config.status) && <datalist id={`${resource}-${field}`}>{config.status.map((option) => <option key={option} value={option} />)}</datalist>}</label>)}<div className="full form-actions"><button type="submit">Adicionar</button></div></form>}
    <div className="marketing-list">{items.map((item) => <article className="card marketing-card" key={item.id}><div><span>{item.category || item.platform || item.stage || item.status}</span><strong className="record-title">{item.title || item.name || item.lead_name || item.platform}</strong></div>{['caption','script','message','hook','cta','hashtags','status','publish_date','stage','next_contact_date'].map((field) => item[field] ? <p key={field}><b>{labels[field]}:</b> {item[field]}</p> : null)}{(item.caption || item.script || item.message) && <button type="button" className="secondary" onClick={() => copy(item.caption || item.script || item.message)}>Copiar texto</button>}</article>)}{!items.length && <article className="card empty-state">Nenhum registro encontrado.</article>}</div>
  </section>;
}

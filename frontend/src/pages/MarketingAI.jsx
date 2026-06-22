import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const leadStatuses = ['Novo lead', 'Interessado', 'Avaliação marcada', 'Negociação', 'Fechado', 'Perdido'];
const interests = ['Implantes', 'Ortodontia', 'Prótese', 'Estética'];
const leadSources = ['Instagram', 'TikTok', 'Facebook', 'WhatsApp', 'Indicação', 'Panfleto', 'Google', 'Tráfego pago'];
const campaignStatus = ['Ativa', 'Pausada', 'Encerrada'];

const resources = {
  calendar: { title: 'Calendário de Conteúdo', description: 'Planejamento mensal e semanal com status Pendente, Agendado e Publicado.', fields: ['title','publish_date','week','channel','content_type','category','status','caption','cta','hashtags'], categories: ['Implantes','Prótese Protocolo','Ortodontia','Botox','Harmonização','Clareamento'], status: ['Pendente','Agendado','Publicado'] },
  captions: { title: 'Banco de Legendas', description: 'Legendas com busca, filtros, CTA, hashtags e botão de copiar.', fields: ['title','category','caption','cta','hashtags'], categories: ['Implantes','Prótese Protocolo','Ortodontia','Botox','Harmonização','Clareamento'] },
  reels: { title: 'Biblioteca de Reels', description: 'Roteiros com gancho, CTA, duração e categoria.', fields: ['title','category','hook','script','cta','duration_seconds'], categories: ['Implantes','Prótese Protocolo','Ortodontia','Botox','Harmonização','Clareamento'] },
  stories: { title: 'Banco de Stories', description: 'Ideias separadas por Bastidores, Promoções, Autoridade e Depoimentos.', fields: ['title','category','script','cta'], categories: ['Bastidores','Promoções','Autoridade','Depoimentos'] },
  metrics: { title: 'Painel de Métricas', description: 'Estrutura para Instagram, TikTok, Facebook e WhatsApp.', fields: ['platform','metric_date','reach','views','followers','likes','shares'], categories: ['Instagram','TikTok','Facebook','WhatsApp'] },
  crm: { title: 'CRM Comercial', description: 'Funil completo para leads de implantes, ortodontia, prótese e estética.', fields: ['name','phone_whatsapp','interest','source','campaign','status','next_contact_date','notes'], status: leadStatuses, categories: interests },
  agenda: { title: 'Agenda Comercial', description: 'Próximos contatos e retornos comerciais.', fields: ['lead_name','contact_date','contact_time','channel','reason','status','notes'], status: ['Pendente','Realizado','Remarcar'] },
  sources: { title: 'Fontes de Lead', description: 'Cadastro das origens usadas na captação automática.', fields: ['name','active','notes'] },
  campaigns: { title: 'Links e Códigos de Campanha', description: 'Códigos internos por origem, tratamento, responsável, custo e integrações futuras.', fields: ['internal_code','origin','treatment','responsible','status','cost','observations','future_integration'], status: campaignStatus },
  whatsapp: { title: 'WhatsApp Inteligente', description: 'Mensagens automáticas por tratamento e relacionamento.', fields: ['title','category','message'], categories: ['Implantes','Ortodontia','Prótese','Reativação','Pós-operatório'] },
};

const labels = { internal_code:'Código interno', origin:'Origem', treatment:'Tratamento', responsible:'Responsável', cost:'Custo', observations:'Observações', future_integration:'Integração futura', active:'Ativo', title:'Título', publish_date:'Data', week:'Semana', channel:'Canal', content_type:'Formato', category:'Categoria', status:'Status', caption:'Legenda', cta:'CTA', hashtags:'Hashtags', hook:'Gancho', script:'Roteiro', duration_seconds:'Duração (seg)', platform:'Plataforma', metric_date:'Data', reach:'Alcance', views:'Visualizações', followers:'Seguidores', likes:'Curtidas', shares:'Compartilhamentos', name:'Nome', phone:'WhatsApp', phone_whatsapp:'Telefone/WhatsApp', source:'Origem', campaign:'Campanha', interest:'Interesse', stage:'Etapa', next_contact_date:'Próximo contato', last_contact_at:'Último contato', lead_name:'Lead', contact_date:'Data', contact_time:'Hora', reason:'Motivo', message:'Mensagem', notes:'Observações' };
const textAreas = new Set(['caption','script','message','notes','observations']);

function blank(config) { return Object.fromEntries(config.fields.map((field) => [field, field.includes('date') ? new Date().toISOString().slice(0, 10) : ''])); }
function formatDate(value) { return value ? new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR') : '-'; }

function fieldInput(field, value, onChange, resource, config) {
  if (textAreas.has(field)) return <textarea value={value || ''} onChange={(e) => onChange(field, e.target.value)} required={['caption','script','message'].includes(field)} />;
  const options = field === 'interest' ? interests : field === 'origin' ? leadSources : ['status','stage'].includes(field) ? config.status : field === 'category' ? config.categories : null;
  return <><input type={field.includes('date') ? 'date' : field.includes('time') ? 'time' : field.includes('seconds') || ['reach','views','followers','likes','shares','cost','active'].includes(field) ? 'number' : 'text'} value={value || ''} onChange={(e) => onChange(field, e.target.value)} list={options ? `${resource}-${field}` : undefined} required={['title','category','platform','name','lead_name','phone_whatsapp','interest','status','internal_code','origin'].includes(field)} />{options && <datalist id={`${resource}-${field}`}>{options.map((option) => <option key={option} value={option} />)}</datalist>}</>;
}


function CaptureView({ readOnly }) {
  const [sources, setSources] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [dashboard, setDashboard] = useState({ by_origin: [], by_campaign: [], cost_per_lead: [], future_integrations: [] });
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', interest: '', origin: 'Instagram', campaign: '', observation: '' });
  const [campaignForm, setCampaignForm] = useState({ internal_code: '', origin: 'Instagram', treatment: '', responsible: '', status: 'Ativa', cost: 0, observations: '', future_integration: '' });
  const [message, setMessage] = useState('');
  async function load() {
    const [sourceRows, campaignRows, captureMetrics] = await Promise.all([api.get('/marketing-ai/sources'), api.get('/marketing-ai/campaigns'), api.get('/marketing-ai/capture/dashboard')]);
    setSources(sourceRows); setCampaigns(campaignRows); setDashboard(captureMetrics);
  }
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);
  async function submitLead(event) {
    event.preventDefault();
    await api.post('/marketing-ai/capture/leads', leadForm);
    setLeadForm({ name: '', phone: '', interest: '', origin: 'Instagram', campaign: '', observation: '' });
    setMessage('Lead captado e enviado automaticamente para o Kanban em Novo lead.');
    await load();
  }
  async function submitCampaign(event) {
    event.preventDefault();
    await api.post('/marketing-ai/campaigns', campaignForm);
    setCampaignForm({ internal_code: '', origin: 'Instagram', treatment: '', responsible: '', status: 'Ativa', cost: 0, observations: '', future_integration: '' });
    setMessage('Campanha criada com sucesso.');
    await load();
  }
  return <section><div className="page-header"><div><h2>Captação automática de leads</h2><p>Entrada rápida de interessados de redes sociais, WhatsApp, indicação, panfleto, Google e tráfego pago.</p></div><span className="badge">Fase 3</span></div>{message && <p className="alert success">{message}</p>}<div className="metrics-grid">{[['total_leads','Leads captados'],['scheduled_evaluations','Avaliações marcadas'],['closed','Fechamentos']].map(([key,label]) => <article className="metric-card" key={key}><span>{label}</span><strong>{dashboard[key] ?? 0}</strong></article>)}</div>{!readOnly && <form className="form-grid" onSubmit={submitLead}><h3 className="full">Formulário rápido de entrada de lead</h3>{['name','phone','interest','origin','campaign','observation'].map((field) => <label className={field === 'observation' ? 'full' : ''} key={field}>{labels[field] || 'Observação'}{field === 'origin' ? <select value={leadForm.origin} onChange={(e) => setLeadForm({ ...leadForm, origin: e.target.value })}>{sources.map((source) => <option key={source.id}>{source.name}</option>)}</select> : field === 'campaign' ? <select value={leadForm.campaign} onChange={(e) => setLeadForm({ ...leadForm, campaign: e.target.value })}><option value="">Sem campanha</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.internal_code}>{campaign.internal_code} — {campaign.treatment || campaign.origin}</option>)}</select> : field === 'observation' ? <textarea value={leadForm.observation} onChange={(e) => setLeadForm({ ...leadForm, observation: e.target.value })} /> : <input required={['name','phone','interest'].includes(field)} value={leadForm[field]} onChange={(e) => setLeadForm({ ...leadForm, [field]: e.target.value })} />}</label>)}<div className="full form-actions"><button type="submit">Captar lead</button></div></form>}
  {!readOnly && <form className="form-grid" onSubmit={submitCampaign}><h3 className="full">Criar link/código de campanha</h3>{resources.campaigns.fields.map((field) => <label className={textAreas.has(field) ? 'full' : ''} key={field}>{labels[field]}{fieldInput(field, campaignForm[field], (name, value) => setCampaignForm({ ...campaignForm, [name]: value }), 'campaigns', resources.campaigns)}</label>)}<div className="full form-actions"><button type="submit">Criar campanha</button></div></form>}
  <div className="capture-grid"><article className="card"><span>Leads por origem</span>{dashboard.by_origin.map((item) => <p key={item.label}><b>{item.label}:</b> {item.total}</p>)}</article><article className="card"><span>Leads por campanha</span>{dashboard.by_campaign.map((item) => <p key={item.label}><b>{item.label}:</b> {item.total}</p>)}</article><article className="card"><span>Custo por lead</span>{dashboard.cost_per_lead.map((item) => <p key={item.internal_code}><b>{item.internal_code}:</b> R$ {item.cost_per_lead}</p>)}</article><article className="card"><span>Estrutura futura pronta</span>{dashboard.future_integrations.map((item) => <p key={item}>• {item}</p>)}</article></div></section>;
}

function CrmView({ readOnly }) {
  const config = resources.crm;
  const [items, setItems] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [agenda, setAgenda] = useState({ today: [], overdue: [], future: [] });
  const [form, setForm] = useState(() => ({ ...blank(config), status: 'Novo lead' }));
  const [message, setMessage] = useState('');

  async function load() {
    const [leads, metrics, schedule] = await Promise.all([api.get('/marketing-ai/crm'), api.get('/marketing-ai/crm/dashboard'), api.get('/marketing-ai/crm/agenda')]);
    setItems(leads); setDashboard(metrics); setAgenda(schedule);
  }
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);
  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  async function submit(event) { event.preventDefault(); await api.post('/marketing-ai/crm', form); setForm({ ...blank(config), status: 'Novo lead' }); setMessage('Lead cadastrado com sucesso.'); await load(); }
  async function moveLead(lead, status) { await api.put(`/marketing-ai/crm/${lead.id}`, { ...lead, status }); await load(); }
  async function whatsapp(lead) {
    const result = await api.post(`/marketing-ai/crm/${lead.id}/whatsapp-contact`, {});
    window.open(result.whatsapp_url, '_blank', 'noopener,noreferrer');
    setMessage('Contato registrado e WhatsApp aberto.');
    await load();
  }

  return <section>
    <div className="page-header"><div><h2>CRM Comercial</h2><p>Leads de implantes, ortodontia, prótese e estética com Kanban, agenda e WhatsApp.</p></div><span className="badge">{items.length} leads</span></div>
    <div className="metrics-grid">{[['total_leads','Total de leads'],['scheduled_evaluations','Avaliações marcadas'],['closed','Fechados'],['lost','Perdidos'],['conversion_rate','Taxa de conversão']].map(([key,label]) => <article className="metric-card" key={key}><span>{label}</span><strong>{dashboard[key] ?? 0}{key === 'conversion_rate' ? '%' : ''}</strong></article>)}</div>
    {message && <p className="alert success">{message}</p>}
    {!readOnly && <form className="form-grid" onSubmit={submit}>{config.fields.map((field) => <label className={textAreas.has(field) ? 'full' : ''} key={field}>{labels[field]}{fieldInput(field, form[field], update, 'crm', config)}</label>)}<div className="full form-actions"><button type="submit">Cadastrar lead</button></div></form>}
    <div className="agenda-grid">{[['today','Leads para ligar hoje'],['overdue','Leads atrasados'],['future','Retornos futuros']].map(([key,label]) => <article className="card" key={key}><span>{label}</span>{agenda[key]?.length ? agenda[key].map((lead) => <p key={lead.id}><b>{lead.name}</b> — {formatDate(lead.next_contact_date)} — {lead.interest}</p>) : <p>Nenhum lead.</p>}</article>)}</div>
    <div className="kanban-board">{leadStatuses.map((status) => <section className="kanban-column" key={status}><h3>{status}</h3>{items.filter((lead) => lead.status === status || lead.stage === status).map((lead) => <article className="card lead-card" key={lead.id}><strong className="record-title">{lead.name}</strong><p><b>WhatsApp:</b> {lead.phone_whatsapp || lead.phone}</p><p><b>Interesse:</b> {lead.interest}</p><p><b>Origem:</b> {lead.source || '-'} / {lead.campaign || '-'}</p><p><b>Próximo contato:</b> {formatDate(lead.next_contact_date)}</p>{lead.notes && <p><b>Observações:</b> {lead.notes}</p>}<div className="form-actions">{!readOnly && <select value={lead.status} onChange={(e) => moveLead(lead, e.target.value)}>{leadStatuses.map((option) => <option key={option}>{option}</option>)}</select>}<button type="button" className="whatsapp-button" onClick={() => whatsapp(lead)}>WhatsApp</button></div></article>)}</section>)}</div>
  </section>;
}

export default function MarketingAI({ resource = 'calendar', readOnly = false }) {
  if (resource === 'capture') return <CaptureView readOnly={readOnly} />;
  if (resource === 'crm') return <CrmView readOnly={readOnly} />;
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
  return <section><div className="page-header"><div><h2>{config.title}</h2><p>{config.description}</p></div><span className="badge">{items.length} itens</span></div><div className="metrics-grid">{Object.entries({ calendar:'Calendário', captions:'Legendas', reels:'Reels', stories:'Stories', metrics:'Métricas', crm:'Leads', sources:'Fontes', campaigns:'Campanhas de captação', agenda:'Contatos', whatsapp:'WhatsApp' }).map(([key, label]) => <article className="metric-card" key={key}><span>{label}</span><strong>{summary[key] ?? 0}</strong></article>)}</div>{message && <p className="alert success">{message}</p>}<div className="search-card filters"><label>Buscar<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por texto" /></label>{config.categories && <label>Filtrar categoria<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Todas</option>{config.categories.map((option) => <option key={option}>{option}</option>)}</select></label>}</div>{!readOnly && <form className="form-grid" onSubmit={submit}>{config.fields.map((field) => <label className={textAreas.has(field) ? 'full' : ''} key={field}>{labels[field] || field}{fieldInput(field, form[field], update, resource, config)}</label>)}<div className="full form-actions"><button type="submit">Adicionar</button></div></form>}<div className="marketing-list">{items.map((item) => <article className="card marketing-card" key={item.id}><div><span>{item.category || item.platform || item.stage || item.status}</span><strong className="record-title">{item.title || item.internal_code || item.name || item.lead_name || item.platform}</strong></div>{['origin','treatment','responsible','cost','future_integration','caption','script','message','hook','cta','hashtags','status','publish_date','stage','next_contact_date'].map((field) => item[field] ? <p key={field}><b>{labels[field]}:</b> {item[field]}</p> : null)}{(item.caption || item.script || item.message) && <button type="button" className="secondary" onClick={() => copy(item.caption || item.script || item.message)}>Copiar texto</button>}</article>)}{!items.length && <article className="card empty-state">Nenhum registro encontrado.</article>}</div></section>;
}

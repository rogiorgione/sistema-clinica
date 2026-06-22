import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const stages = ['Novo lead', 'Contato feito', 'Avaliação marcada', 'Proposta enviada', 'Negociação', 'Fechado', 'Perdido'];
const labels = { name: 'Nome', phone_whatsapp: 'WhatsApp', email: 'E-mail', source: 'Origem', interest: 'Interesse', pipeline_stage: 'Etapa', temperature: 'Temperatura', estimated_value: 'Valor estimado', next_contact_date: 'Próximo contato', notes: 'Observações', title: 'Título', due_date: 'Vencimento', priority: 'Prioridade', status: 'Status', channel: 'Canal', budget: 'Orçamento', cost: 'Custo', objective: 'Objetivo', scheduled_date: 'Data', message: 'Mensagem', category: 'Categoria', objection: 'Objeção', suggested_response: 'Resposta sugerida' };
const pageInfo = {
  commercial: ['Central Comercial', 'Visão geral de leads, tarefas, notificações e campanhas.'],
  pipeline: ['Pipeline', 'Kanban comercial para mover oportunidades por etapa.'],
  leads: ['Leads', 'Cadastro simples de contatos comerciais odontológicos.'],
  followup: ['Follow-up', 'Retornos comerciais pendentes e automáticos.'],
  objections: ['Objeções', 'Biblioteca prática de objeções e respostas sugeridas.'],
  crmCampaigns: ['Campanhas', 'Ranking de campanhas por conversão e receita.'],
  commercialReports: ['Relatórios', 'Métricas de conversão e desempenho comercial.'],
  commercialDashboard: ['Dashboard Comercial', 'Indicadores executivos da Central Comercial Inteligente.'],
};

function today() { return new Date().toISOString().slice(0, 10); }
function emptyLead() { return { name: '', phone_whatsapp: '', email: '', source: 'Instagram', interest: 'Implantes', pipeline_stage: 'Novo lead', temperature: 'Morno', estimated_value: 0, next_contact_date: today(), notes: '' }; }
function money(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function CommercialCenter({ page = 'commercial', readOnly = false }) {
  const [dashboard, setDashboard] = useState({ leads: [], tasks: [], followups: [], notifications: [], metrics: { by_stage: [], campaign_ranking: [] } });
  const [leadForm, setLeadForm] = useState(emptyLead);
  const [campaignForm, setCampaignForm] = useState({ name: '', channel: 'Instagram', budget: 0, cost: 0, status: 'Ativa', objective: '', notes: '' });
  const [message, setMessage] = useState('');
  const [objections, setObjections] = useState([]);

  async function load() { const [crmDashboard, objectionRows] = await Promise.all([api.get('/crm/dashboard'), api.get('/crm/objections')]); setDashboard(crmDashboard); setObjections(objectionRows); }
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);
  async function saveLead(event) { event.preventDefault(); await api.post('/crm/leads', leadForm); setLeadForm(emptyLead()); setMessage('Lead criado com tarefa automática, follow-up e notificação.'); await load(); }
  async function moveLead(lead, pipeline_stage) { await api.put(`/crm/leads/${lead.id}`, { ...lead, pipeline_stage, status: pipeline_stage }); await load(); }
  async function saveCampaign(event) { event.preventDefault(); await api.post('/crm/campaigns', campaignForm); setCampaignForm({ name: '', channel: 'Instagram', budget: 0, cost: 0, status: 'Ativa', objective: '', notes: '' }); setMessage('Campanha criada.'); await load(); }
  async function openWhatsApp(lead) { const result = await api.post(`/crm/leads/${lead.id}/whatsapp-contact`, {}); window.open(result.whatsapp_url, '_blank', 'noopener,noreferrer'); await load(); }

  const [title, description] = pageInfo[page] || pageInfo.commercial;
  const metrics = dashboard.metrics || {};
  const leadFields = ['name', 'phone_whatsapp', 'email', 'source', 'interest', 'pipeline_stage', 'temperature', 'estimated_value', 'next_contact_date', 'notes'];

  return <section>
    <div className="page-header"><div><h2>{title}</h2><p>{description}</p></div><span className="badge">Fase 7</span></div>
    {message && <p className="alert success">{message}</p>}
    <div className="metrics-grid">{[['total_leads', 'Leads'], ['evaluations', 'Avaliações'], ['closed', 'Fechados'], ['conversion_rate', 'Conversão'], ['open_tasks', 'Tarefas abertas'], ['revenue', 'Receita']].map(([key, label]) => <article className="metric-card" key={key}><span>{label}</span><strong>{key === 'revenue' ? money(metrics[key]) : `${metrics[key] ?? 0}${key === 'conversion_rate' ? '%' : ''}`}</strong></article>)}</div>

    {['commercial', 'commercialDashboard'].includes(page) && <div className="agenda-grid"><article className="card"><span>Notificações</span>{dashboard.notifications?.map((item) => <p key={item.id}><b>{item.title}</b> — {item.due_date || 'sem data'}</p>)}{!dashboard.notifications?.length && <p>Nenhuma notificação pendente.</p>}</article><article className="card"><span>Tarefas automáticas</span>{dashboard.tasks?.map((item) => <p key={item.id}><b>{item.title}</b> — {item.due_date || 'sem data'} — {item.priority}</p>)}{!dashboard.tasks?.length && <p>Nenhuma tarefa aberta.</p>}</article><article className="card"><span>Follow-ups</span>{dashboard.followups?.map((item) => <p key={item.id}><b>{item.channel}</b> — {item.scheduled_date} — {item.status}</p>)}{!dashboard.followups?.length && <p>Nenhum follow-up pendente.</p>}</article></div>}

    {['pipeline', 'commercial'].includes(page) && <div className="kanban-board">{stages.map((stage) => <section className="kanban-column" key={stage}><h3>{stage}</h3>{dashboard.leads?.filter((lead) => lead.pipeline_stage === stage || lead.status === stage).map((lead) => <article className="card lead-card" key={lead.id}><strong className="record-title">{lead.name}</strong><p><b>Interesse:</b> {lead.interest}</p><p><b>WhatsApp:</b> {lead.phone_whatsapp || lead.phone}</p><p><b>Valor:</b> {money(lead.estimated_value)}</p><p><b>Próximo contato:</b> {lead.next_contact_date || '-'}</p><div className="form-actions">{!readOnly && <select value={lead.pipeline_stage} onChange={(e) => moveLead(lead, e.target.value)}>{stages.map((option) => <option key={option}>{option}</option>)}</select>}<button type="button" className="whatsapp-button" onClick={() => openWhatsApp(lead)}>WhatsApp</button></div></article>)}</section>)}</div>}

    {page === 'leads' && !readOnly && <form className="form-grid" onSubmit={saveLead}><h3 className="full">Cadastrar lead</h3>{leadFields.map((field) => <label className={field === 'notes' ? 'full' : ''} key={field}>{labels[field]}{field === 'notes' ? <textarea value={leadForm[field]} onChange={(e) => setLeadForm({ ...leadForm, [field]: e.target.value })} /> : field === 'pipeline_stage' ? <select value={leadForm[field]} onChange={(e) => setLeadForm({ ...leadForm, [field]: e.target.value })}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select> : <input required={['name', 'phone_whatsapp'].includes(field)} type={field.includes('date') ? 'date' : field === 'estimated_value' ? 'number' : 'text'} value={leadForm[field]} onChange={(e) => setLeadForm({ ...leadForm, [field]: e.target.value })} />}</label>)}<div className="full form-actions"><button type="submit">Salvar lead</button></div></form>}

    {page === 'followup' && <div className="marketing-list">{dashboard.followups?.map((item) => <article className="card marketing-card" key={item.id}><strong className="record-title">{item.channel} em {item.scheduled_date}</strong><p>{item.message}</p><span>{item.status}</span></article>)}</div>}
    {page === 'objections' && <div className="marketing-list">{objections.map((item, index) => <article className="card marketing-card" key={`${item.category}-${index}`}><span>{item.category}</span><strong className="record-title">{item.objection}</strong><p>{item.suggested_response}</p></article>)}</div>}
    {page === 'crmCampaigns' && <>{!readOnly && <form className="form-grid" onSubmit={saveCampaign}><h3 className="full">Nova campanha</h3>{['name', 'channel', 'budget', 'cost', 'status', 'objective', 'notes'].map((field) => <label className={field === 'notes' ? 'full' : ''} key={field}>{labels[field] || field}{field === 'notes' ? <textarea value={campaignForm[field]} onChange={(e) => setCampaignForm({ ...campaignForm, [field]: e.target.value })} /> : <input required={field === 'name'} type={['budget', 'cost'].includes(field) ? 'number' : 'text'} value={campaignForm[field]} onChange={(e) => setCampaignForm({ ...campaignForm, [field]: e.target.value })} />}</label>)}<div className="full form-actions"><button type="submit">Criar campanha</button></div></form>}<div className="marketing-list">{metrics.campaign_ranking?.map((item) => <article className="card marketing-card" key={item.id}><strong className="record-title">{item.name}</strong><p><b>Leads:</b> {item.leads} | <b>Vendas:</b> {item.sales} | <b>Conversão:</b> {item.conversion_rate}% | <b>ROI:</b> {item.roi}%</p></article>)}</div></>}
    {page === 'commercialReports' && <div className="capture-grid"><article className="card"><span>Conversão</span><p>Taxa de avaliação: {metrics.evaluation_rate || 0}%</p><p>Taxa de venda: {metrics.conversion_rate || 0}%</p></article><article className="card"><span>Etapas</span>{metrics.by_stage?.map((item) => <p key={item.stage}><b>{item.stage}:</b> {item.total} leads — {money(item.value)}</p>)}</article><article className="card"><span>Ranking de campanhas</span>{metrics.campaign_ranking?.map((item) => <p key={item.id}><b>{item.name}:</b> {item.sales} vendas / {item.leads} leads</p>)}</article></div>}
  </section>;
}

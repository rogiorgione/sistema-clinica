import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const pageConfig = {
  trafficCenter: { title: 'Central de Tráfego', kind: 'dashboard' },
  trafficCampaigns: { title: 'Campanhas', path: '/ads/campaigns', fields: ['name','platform','objective','status','budget','spent','start_date','end_date','target_audience','notes'] },
  trafficPlatforms: { title: 'Plataformas', path: '/ads/platforms', fields: ['name','type','status','official_api','oauth_scopes','notes'] },
  trafficLeads: { title: 'Leads por origem', path: '/ads/leads', fields: ['name','phone','email','source','platform','interest','status','scheduled_consultation','closed_treatment','revenue','notes'] },
  trafficMetrics: { title: 'Métricas', path: '/ads/metrics', fields: ['campaign_id','platform','metric_date','impressions','reach','clicks','leads','cost_per_lead','scheduled_consultations','closed_treatments','revenue_generated','roi','conversion_rate'] },
  trafficRoi: { title: 'Dashboard ROI', kind: 'dashboard' },
  socialIntegrations: { title: 'Integrações Sociais', kind: 'integrations' },
  apiSettings: { title: 'Configurações de API', path: '/api-credentials', fields: ['provider','app_id','app_secret','client_id','client_secret','redirect_uri','scopes','status','notes'] },
};
const labels = { name:'Nome', platform:'Plataforma', objective:'Objetivo', status:'Status', budget:'Orçamento', spent:'Investido', start_date:'Início', end_date:'Fim', target_audience:'Público', notes:'Observações', type:'Tipo', official_api:'API oficial', oauth_scopes:'Permissões OAuth', phone:'Telefone', email:'E-mail', source:'Origem', interest:'Interesse', scheduled_consultation:'Consultas agendadas', closed_treatment:'Tratamentos fechados', revenue:'Receita', campaign_id:'Campanha ID', metric_date:'Data', impressions:'Impressões', reach:'Alcance', clicks:'Cliques', leads:'Leads', cost_per_lead:'Custo por lead', scheduled_consultations:'Consultas agendadas', closed_treatments:'Tratamentos fechados', revenue_generated:'Receita gerada', roi:'ROI', conversion_rate:'Taxa de conversão', provider:'Provedor', app_id:'App ID', app_secret:'App secret', client_id:'Client ID', client_secret:'Client secret', redirect_uri:'Redirect URI', scopes:'Escopos' };
const textarea = new Set(['notes','oauth_scopes','target_audience','scopes']);
function blank(fields) { return Object.fromEntries(fields.map((f) => [f, f.includes('date') ? new Date().toISOString().slice(0, 10) : ''])); }
function money(v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

function Dashboard() {
  const [data, setData] = useState({ campaign_ranking: [] });
  useEffect(() => { api.get('/ads/dashboard').then(setData).catch(console.error); }, []);
  return <><div className="metrics-grid">{[['investment_month','Investimento do mês', money(data.investment_month)],['leads_generated','Leads gerados', data.leads_generated],['cost_per_lead','Custo por lead', money(data.cost_per_lead)],['predicted_revenue','Receita prevista', money(data.predicted_revenue)],['roi','ROI', `${data.roi || 0}%`]].map(([k,l,v]) => <article className="metric-card" key={k}><span>{l}</span><strong>{v}</strong></article>)}</div><div className="capture-grid"><article className="card"><span>Melhor campanha</span><strong>{data.best_campaign?.name || '-'}</strong></article><article className="card"><span>Melhor plataforma</span><strong>{data.best_platform?.platform || '-'}</strong></article><article className="card"><span>Integrações oficiais preparadas</span><p>Meta Graph API, Instagram Graph API, Facebook Pages API, Meta Marketing API, TikTok APIs, Google Ads API e WhatsApp Business API.</p></article></div><h3>Ranking de campanhas</h3><div className="marketing-list">{data.campaign_ranking?.map((c) => <article className="card" key={c.id}><strong>{c.name}</strong><p>{c.platform} — Leads: {c.leads} — Receita: {money(c.revenue)} — ROI: {c.roi}%</p></article>)}</div></>;
}

function Integrations({ readOnly }) {
  const [rows, setRows] = useState([]); const [accounts, setAccounts] = useState([]); const [msg, setMsg] = useState('');
  async function load(){ const [i,a]=await Promise.all([api.get('/social/integrations'), api.get('/social/accounts')]); setRows(i); setAccounts(a); }
  useEffect(()=>{load().catch(e=>setMsg(e.message));},[]);
  async function connect(platform){ const r=await api.get(`/social/connect/${encodeURIComponent(platform)}`); setMsg(r.message); }
  return <><p className="alert success">Estrutura segura por OAuth/API oficial. Não solicitar nem armazenar senhas de Instagram, Facebook, TikTok, Google ou WhatsApp.</p>{msg && <p className="alert success">{msg}</p>}<div className="form-actions">{['Instagram','Facebook','TikTok','Google Ads','WhatsApp Business'].map((p)=><button key={p} type="button" onClick={()=>connect(p.replace(' Business',''))}>Conectar {p}</button>)}</div><div className="marketing-list">{rows.map((r)=><article className="card" key={r.id}><strong>{r.platform}</strong><p><b>Status:</b> {r.status}</p><p><b>API:</b> {r.provider}</p><p><b>Permissões:</b> {r.oauth_scopes || '-'}</p></article>)}</div><h3>Contas conectadas</h3><div className="marketing-list">{accounts.length ? accounts.map((a)=><article className="card" key={a.id}><strong>{a.account_name}</strong><p>{a.platform} — {a.status}</p></article>) : <article className="card empty-state">Nenhuma conta conectada ainda.</article>}</div></>;
}

export default function TrafficCenter({ page = 'trafficCenter', readOnly = false }) {
  const cfg = pageConfig[page] || pageConfig.trafficCenter; const [items,setItems]=useState([]); const [form,setForm]=useState(()=>blank(cfg.fields||[])); const [msg,setMsg]=useState('');
  async function load(){ if(cfg.path) setItems(await api.get(cfg.path)); }
  useEffect(()=>{ setForm(blank(cfg.fields||[])); load().catch(e=>setMsg(e.message)); },[page]);
  async function submit(e){ e.preventDefault(); await api.post(cfg.path, form); setForm(blank(cfg.fields)); setMsg('Registro salvo com segurança.'); await load(); }
  return <section><div className="page-header"><div><h2>{cfg.title}</h2><p>Fase 8 — tráfego, métricas, ROI e integrações sociais preparadas para OAuth e APIs oficiais.</p></div><span className="badge">OAuth/API</span></div>{cfg.kind === 'dashboard' && <Dashboard />}{cfg.kind === 'integrations' && <Integrations readOnly={readOnly} />}{cfg.path && <>{msg && <p className="alert success">{msg}</p>}{!readOnly && <form className="form-grid" onSubmit={submit}>{cfg.fields.map((f)=><label className={textarea.has(f)?'full':''} key={f}>{labels[f]||f}{textarea.has(f)?<textarea value={form[f]||''} onChange={e=>setForm({...form,[f]:e.target.value})}/>:<input type={f.includes('date')?'date':['budget','spent','revenue','roi','leads','clicks','reach','impressions','cost_per_lead','conversion_rate','scheduled_consultation','closed_treatment','scheduled_consultations','closed_treatments'].includes(f)?'number':'text'} value={form[f]||''} onChange={e=>setForm({...form,[f]:e.target.value})} required={['name','platform','provider'].includes(f)} />}</label>)}<div className="full form-actions"><button type="submit">Salvar</button></div></form>}<div className="marketing-list">{items.map((item)=><article className="card" key={item.id}><strong>{item.name || item.provider || item.platform}</strong>{cfg.fields.filter(f=>item[f]).slice(0,8).map(f=><p key={f}><b>{labels[f]||f}:</b> {String(item[f])}</p>)}</article>)}</div></>}</section>;
}

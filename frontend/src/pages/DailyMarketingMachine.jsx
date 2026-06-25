import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const pageConfig = {
  marketingGoals: { title: 'Meta de Orçamentos', endpoint: '/marketing-goals', listKey: 'goals' },
  flyers: { title: 'Panfletagem Rastreável', endpoint: '/flyers/campaigns' },
  quickLead: { title: 'Entrada Rápida de Lead', endpoint: '/lead-capture' },
  commercialRoutine: { title: 'Central SDR', endpoint: '/commercial-routine/today' },
  marketingDaily: { title: 'Painel Diário', endpoint: '/marketing-daily/dashboard' },
  weeklyReport: { title: 'Relatório Semanal', endpoint: '/marketing-weekly/reports' },
  originPerformance: { title: 'Desempenho por Origem', endpoint: '/marketing-origin/performance' },
};

function asArray(data, listKey) {
  if (Array.isArray(data)) return data;
  if (listKey && Array.isArray(data?.[listKey])) return data[listKey];
  if (Array.isArray(data?.checklist)) return data.checklist;
  if (Array.isArray(data?.calls_today)) return data.calls_today;
  if (Array.isArray(data?.whatsapp_today)) return data.whatsapp_today;
  if (Array.isArray(data?.reports)) return data.reports;
  return [];
}

export default function DailyMarketingMachine({ page, readOnly }) {
  const effectivePage = page === 'commercialRoutine' ? 'sdr' : page;
  const config = effectivePage === 'sdr' ? { title: 'Central SDR', endpoint: '/sdr/dashboard' } : (pageConfig[page] || pageConfig.marketingDaily);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone_whatsapp: '', interest: 'Implante', origin: 'Instagram', campaign: '', urgency: 'Média' });

  async function load() {
    setLoading(true); setError('');
    try { setData(await api.get(config.endpoint)); } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page]);

  async function markLead(leadId, action) {
    if (readOnly) return;
    try {
      await api.post(`/sdr/leads/${leadId}/status`, { action });
      await load();
    } catch (err) { setError(err.message); }
  }

  async function generateWeeklyReport() {
    if (readOnly) return;
    try {
      await api.post('/marketing-weekly/reports/generate', {});
      await load();
    } catch (err) { setError(err.message); }
  }

  async function submitLead(event) {
    event.preventDefault();
    if (readOnly) return;
    try {
      await api.post('/lead-capture', form);
      setForm({ ...form, name: '', phone_whatsapp: '' });
      await load();
    } catch (err) { setError(err.message); }
  }

  const rows = asArray(data, config.listKey);
  const goal = data?.summary || data?.goal || data;
  const cards = [
    ['Meta mensal', goal?.target || goal?.monthly_budget_target || 15],
    ['Orçamentos gerados', goal?.generated || goal?.generated_budgets || 0],
    ['Faltam', goal?.missing ?? 15],
    ['Alerta', goal?.alert || goal?.status || 'abaixo da meta'],
  ];

  return (
    <section className="page-section">
      <div className="section-header"><div><p className="eyebrow">Máquina diária BELLEART</p><h1>{config.title}</h1></div><button onClick={load}>Atualizar</button></div>
      {loading && <p className="empty-state">Carregando dados de marketing...</p>}
      {error && <p className="error-state">Não foi possível carregar: {error}</p>}
      <div className="kpi-grid">{cards.map(([label, value]) => <article className="kpi-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
      {effectivePage === 'sdr' && data?.overdue_followups?.length > 0 && <p className="error-state">Atenção: {data.overdue_followups.length} follow-up(s) atrasado(s). Priorize estes contatos hoje.</p>}
      {page === 'weeklyReport' && <div className="form-actions"><button type="button" onClick={generateWeeklyReport} disabled={readOnly}>Gerar relatório semanal automático</button></div>}
      {page === 'quickLead' && (
        <form className="form-grid" onSubmit={submitLead}>
          <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="WhatsApp" value={form.phone_whatsapp} onChange={(e) => setForm({ ...form, phone_whatsapp: e.target.value })} required />
          <input placeholder="Interesse" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} />
          <select value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}>{['Instagram','TikTok','Facebook','WhatsApp','Panfleto','Indicação','Google','Site','Tráfego pago'].map((o) => <option key={o}>{o}</option>)}</select>
          <input placeholder="Campanha" value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} />
          <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}><option>Alta</option><option>Média</option><option>Baixa</option></select>
          <button disabled={readOnly}>Cadastrar lead e criar follow-up</button>
        </form>
      )}
      {effectivePage === 'sdr' && (
        <div className="capture-grid">
          <article className="card"><h3>Ranking de origem</h3>{data?.origin_ranking?.map((item) => <p key={item.label}><b>{item.label}:</b> {item.leads} leads / {item.budgets || 0} orçamentos</p>)}</article>
          <article className="card"><h3>Ranking de campanha</h3>{data?.campaign_ranking?.map((item) => <p key={item.label}><b>{item.label}:</b> {item.leads} leads / {item.budgets || 0} orçamentos</p>)}</article>
        </div>
      )}
      <div className="table-card">
        <h2>Registros</h2>
        {!rows.length ? <p className="empty-state">Nenhum registro encontrado. Use os formulários para iniciar a rotina.</p> : (
          <table><thead><tr>{Object.keys(rows[0]).slice(0, 6).map((key) => <th key={key}>{key}</th>)}<th>Ações</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.id}-${row.title || row.name || row.item}`}>
            {Object.keys(rows[0]).slice(0, 6).map((key) => <td key={key}>{String(row[key] ?? '')}</td>)}
            <td><div className="form-actions">{row.phone_whatsapp ? <a className="button-link" href={`https://wa.me/55${String(row.phone_whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(row.suggested_whatsapp_message || 'Olá! Podemos falar sobre sua avaliação na BELLEART?')}`} target="_blank" rel="noreferrer">Abrir WhatsApp</a> : <button type="button">Copiar mensagem</button>}{effectivePage === 'sdr' && ['contacted','scheduled','budget_sent','closed','lost'].map((action) => <button key={action} type="button" onClick={() => markLead(row.id, action)} disabled={readOnly}>{({ contacted: 'Contatado', scheduled: 'Avaliação', budget_sent: 'Orçamento', closed: 'Fechado', lost: 'Perdido' })[action]}</button>)}</div></td>
          </tr>)}</tbody></table>
        )}
      </div>
    </section>
  );
}

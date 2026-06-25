import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

function Metric({ label, value }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article>;
}

function Task({ task }) {
  return <article className={`today-task ${task.priority === 'Urgente' ? 'urgent' : ''}`}><div><span>{task.priority}</span><h2>{task.title}</h2><p>{task.detail}</p></div><strong>{task.action}</strong></article>;
}

export default function MarketingEmployeeDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  async function load() { try { setError(''); setData(await api.get('/marketing-employee/dashboard')); } catch (err) { setError(err.message); } }
  useEffect(() => { load(); }, []);

  if (error) return <p className="alert error">Não foi possível carregar o funcionário virtual: {error}</p>;
  if (!data) return <p className="empty-state">A IA está montando o plano de hoje...</p>;
  const d = data.dashboard || {};

  return <section className="marketing-employee">
    <div className="employee-hero">
      <p className="eyebrow">Funcionário Virtual de Marketing</p>
      <h1>O QUE FAZER HOJE</h1>
      <p>A meta única do BELLEART OS é gerar no mínimo 15 pacientes para orçamento por mês. A IA prioriza o que traz lead e orçamento; o fechamento continua humano.</p>
      <button type="button" onClick={load}>Atualizar plano</button>
    </div>

    <div className="today-list">{data.tasks?.map((task, index) => <Task task={task} key={`${task.title}-${index}`} />)}</div>

    <div className="metrics-grid">
      <Metric label="Meta do mês" value={d.monthly_goal || 15} />
      <Metric label="Orçamentos" value={d.budgets || 0} />
      <Metric label="Leads" value={d.leads || 0} />
      <Metric label="Conversão" value={`${d.conversion || 0}%`} />
      <Metric label="Melhor campanha" value={d.best_campaign || '-'} />
      <Metric label="Melhor origem" value={d.best_origin || '-'} />
      <Metric label="Melhor horário" value={d.best_posting_time || '18:30'} />
      <Metric label="Próximas tarefas" value={d.next_tasks || 0} />
    </div>

    <div className="employee-grid">
      <article className="card"><h3>SDR: quem vem primeiro</h3><p><b>Ligar:</b> {data.sdr?.call_first?.map((i) => i.title).join(' • ') || 'Sem ligações pendentes'}</p><p><b>WhatsApp:</b> {data.sdr?.whatsapp_first?.map((i) => i.title).join(' • ') || 'Sem WhatsApp pendente'}</p><p><b>Quentes:</b> {data.sdr?.hot?.map((l) => l.name).join(' • ') || 'Sem lead quente'}</p></article>
      <article className="card"><h3>IA de Marketing</h3><p><b>Funcionou:</b> {data.analysis?.worked}</p><p><b>Não funcionou:</b> {data.analysis?.not_worked}</p><p><b>Repetir:</b> {data.analysis?.repeat}</p><p><b>Parar:</b> {data.analysis?.stop}</p></article>
      <article className="card"><h3>Conteúdo pronto para aprovar</h3>{data.content?.slice(0,3).map((post) => <p key={post.id}><b>{post.format}:</b> {post.hook}<br />CTA: {post.cta}</p>)}</article>
      <article className="card"><h3>Publicação oficial</h3><p>Nunca armazenar senha. Preparado somente para OAuth/API oficial.</p><p>{data.integrations?.join(' • ')}</p></article>
    </div>
  </section>;
}

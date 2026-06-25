import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

function Metric({ label, value }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article>;
}

export default function BelleartBrain() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [objection, setObjection] = useState('');
  const [answer, setAnswer] = useState(null);

  async function load() {
    setError('');
    setData(await api.get('/brain/workspace'));
  }

  async function analyze(event) {
    event.preventDefault();
    if (!objection.trim()) return;
    setAnswer(await api.post('/brain/objections/analyze', { objection, patientName: 'Paciente', treatment: 'tratamento odontológico' }));
    setObjection('');
    await load();
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  if (error) return <p className="alert error">Não foi possível carregar a BELLEART IA: {error}</p>;
  if (!data) return <p className="empty-state">O Brain está reunindo CRM, agenda, marketing e financeiro...</p>;

  const k = data.kpis || {};
  return <section className="brain-page">
    <div className="brain-hero">
      <p className="eyebrow">BELLEART IA 1.0</p>
      <h1>Central única de trabalho</h1>
      <p>O Dashboard tradicional foi substituído por uma tela operacional: o Brain reúne marketing, WhatsApp, calendário, biblioteca, agenda, CRM, financeiro, KPIs, aprendizado e recomendações em um só lugar.</p>
      <button type="button" onClick={load}>Atualizar Brain</button>
    </div>

    <div className="metrics-grid">
      <Metric label="Pacientes novos" value={k.new_patients || 0} />
      <Metric label="Conversão" value={`${k.conversion_rate || 0}%`} />
      <Metric label="Receita" value={`R$ ${Number(k.revenue || 0).toLocaleString('pt-BR')}`} />
      <Metric label="Receita perdida" value={`R$ ${Number(k.lost_revenue || 0).toLocaleString('pt-BR')}`} />
      <Metric label="ROI" value={`${k.roi || 0}%`} />
      <Metric label="Ticket médio" value={`R$ ${Number(k.average_ticket || 0).toLocaleString('pt-BR')}`} />
      <Metric label="Previsão mensal" value={`R$ ${Number(k.monthly_forecast || 0).toLocaleString('pt-BR')}`} />
      <Metric label="Follow-ups" value={k.pending_followups || 0} />
    </div>

    <div className="brain-grid">
      <article className="card"><h3>{data.goal.title}</h3><p>{data.goal.target}</p><p><b>Impacto:</b> {data.goal.expected_impact}</p></article>
      <article className="card"><h3>Planejador estratégico</h3><p><b>Meta:</b> {data.strategy.weekly_goal}</p><ul>{data.strategy.plan.map((item) => <li key={item}>{item}</li>)}</ul><p>{data.strategy.expected_result}</p></article>
      <article className="card"><h3>Marketing preditivo</h3><p><b>Tendência:</b> {data.predictive.trend}</p><p><b>Melhor horário:</b> {data.predictive.best_time}</p><p><b>Sazonalidade:</b> {data.predictive.seasonality}</p></article>
      <article className="card"><h3>Brain Analytics</h3><p><b>Decisão:</b> {data.analytics.decision}</p><p><b>Confiança:</b> {data.analytics.confidence}%</p><p><b>Dados:</b> {data.analytics.data_used.join(', ')}</p></article>
    </div>

    <div className="brain-grid">
      <article className="card"><h3>Missões de hoje</h3>{data.missions.map((mission) => <p key={mission.title}><b>{mission.title}</b><br />Tempo: {mission.time} • Impacto: {mission.impact} • Confiança: {mission.confidence}%</p>)}</article>
      <article className="card"><h3>IA de objeções</h3><form onSubmit={analyze} className="inline-form"><input value={objection} onChange={(event) => setObjection(event.target.value)} placeholder="Ex.: achei caro / tenho medo" /><button type="submit">Responder</button></form>{answer && <div className="brain-answer"><p><b>Categoria:</b> {answer.category}</p><p>{answer.suggested_response}</p><p><b>Próxima ação:</b> {answer.next_action}</p><p><b>Chance:</b> {answer.conversion_chance}%</p></div>}</article>
      <article className="card"><h3>Calendário e conteúdo</h3>{data.content_plan.slice(0, 5).map((post) => <p key={`${post.title}-${post.scheduled_date}`}><b>{post.scheduled_date} • {post.format}</b><br />{post.hook || post.title}<br />CTA: {post.cta}</p>)}</article>
      <article className="card"><h3>Memória e aprendizado</h3>{data.memory.length ? data.memory.map((item) => <p key={`${item.created_at}-${item.title}`}><b>{item.memory_type}:</b> {item.title} ({item.confidence}%)</p>) : <p>O Brain registrará objeções, sucessos, erros, campanhas e decisões conforme o uso.</p>}</article>
    </div>
  </section>;
}

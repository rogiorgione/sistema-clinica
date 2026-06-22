import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const indicatorCards = [
  { key: 'totalPatients', label: 'Pacientes ativos', hint: 'Base cadastrada no BELLEART OS' },
  { key: 'todayAppointments', label: 'Atendimentos hoje', hint: 'Agenda do dia para a clínica' },
  { key: 'treatmentBudgets', label: 'Orçamentos em tratamento', hint: 'Oportunidades em acompanhamento' },
];

export default function ExecutivePanel() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    api.get('/dashboard')
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((apiError) => {
        if (isMounted) setError(apiError.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const conversionBase = summary?.totalPatients || 0;
  const opportunities = summary?.treatmentBudgets || 0;
  const conversionRate = conversionBase ? Math.round((opportunities / conversionBase) * 100) : 0;

  return (
    <section className="executive-panel">
      <div className="page-header executive-hero">
        <div>
          <span className="eyebrow">Painel Executivo</span>
          <h2>Visão estratégica da clínica</h2>
          <p>Indicadores consolidados para acompanhar operação, agenda e oportunidades comerciais.</p>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {!summary && !error && <p className="alert">Carregando indicadores executivos...</p>}

      <div className="executive-grid">
        {indicatorCards.map((card) => (
          <article className="card executive-card" key={card.key}>
            <span>{card.label}</span>
            <strong>{summary?.[card.key] ?? 0}</strong>
            <small>{card.hint}</small>
          </article>
        ))}
      </div>

      <div className="insight-grid">
        <article className="card insight-card">
          <span>Conversão estimada</span>
          <strong>{conversionRate}%</strong>
          <p>Relação entre orçamentos em tratamento e pacientes cadastrados.</p>
        </article>
        <article className="card insight-card">
          <span>Prioridade do dia</span>
          <strong>{summary?.todayAppointments ? 'Agenda ativa' : 'Sem consultas'}</strong>
          <p>{summary?.todayAppointments ? 'Acompanhe confirmações e faltas para proteger o faturamento.' : 'Use o tempo livre para reativação e follow-up comercial.'}</p>
        </article>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const dashboardCards = [
  { key: 'totalPatients', label: 'Pacientes cadastrados' },
  { key: 'todayAppointments', label: 'Consultas agendadas hoje' },
  { key: 'treatmentBudgets', label: 'Orçamentos em tratamento' },
];

export default function Dashboard() {
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

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Resumo rápido da operação da clínica.</p>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {!summary && !error && <p className="alert">Carregando indicadores...</p>}

      <div className="cards">
        {dashboardCards.map((card) => (
          <article className="card" key={card.key}>
            <span>{card.label}</span>
            <strong>{summary?.[card.key] ?? 0}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

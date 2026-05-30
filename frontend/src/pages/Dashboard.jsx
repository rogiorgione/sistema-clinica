import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then(setSummary).catch((apiError) => setError(apiError.message));
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
      <div className="cards">
        <article className="card">
          <span>Pacientes cadastrados</span>
          <strong>{summary?.totalPatients ?? 0}</strong>
        </article>
        <article className="card">
          <span>Consultas agendadas hoje</span>
          <strong>{summary?.todayAppointments ?? 0}</strong>
        </article>
        <article className="card">
          <span>Orçamentos em tratamento</span>
          <strong>{summary?.treatmentBudgets ?? 0}</strong>
        </article>
      </div>
    </section>
  );
}

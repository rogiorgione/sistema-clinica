import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function ModulePage({ title, path, readOnly = false }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setItems(await api.get(`/${path}`));
  }

  useEffect(() => {
    setError('');
    load().catch((loadError) => setError(loadError.message));
  }, [path]);

  async function submit(event) {
    event.preventDefault();

    try {
      await api.post(`/${path}`, { title: name });
      setName('');
      await load();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>{title}</h2>
          <p>Módulo integrado ao BELLEART OS com controle de acesso e auditoria.</p>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}

      {!readOnly && (
        <form className="search-card inline-form" onSubmit={submit}>
          <label>
            Novo item operacional
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`Adicionar em ${title}`}
              required
            />
          </label>
          <button type="submit">Adicionar</button>
        </form>
      )}

      <div className="cards">
        {items.length ? items.map((item) => (
          <article className="card" key={item.id}>
            <span>{item.status}</span>
            <strong className="record-title">{item.title}</strong>
            <small>{new Date(item.updated_at).toLocaleString('pt-BR')}</small>
          </article>
        )) : (
          <article className="card empty-state">Sem dados cadastrados para esta visão. Adicione o primeiro item para começar.</article>
        )}
      </div>
    </section>
  );
}

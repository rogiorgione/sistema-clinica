import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const tabs = [
  ['reels', 'Reels'],
  ['stories', 'Stories'],
  ['campaigns', 'Campanhas'],
  ['whatsapp', 'WhatsApp'],
  ['hooks', 'Ganchos'],
  ['responses', 'Respostas'],
  ['prompts', 'Banco de Prompts'],
];

const categories = ['Implantes', 'Ortodontia', 'Botox', 'Preenchimento', 'Clareamento', 'Próteses'];
const labels = { title: 'Título', category: 'Categoria', prompt: 'Prompt base', content: 'Conteúdo', cta: 'CTA', notes: 'Observações' };
const fields = ['title', 'category', 'prompt', 'content', 'cta', 'notes'];

function blank() {
  return { title: '', category: 'Implantes', prompt: '', content: '', cta: 'Agende uma avaliação na BELLEART pelo WhatsApp.', notes: '' };
}

export default function AssistantAI({ readOnly = false }) {
  const [activeTab, setActiveTab] = useState('reels');
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');
  const query = useMemo(() => new URLSearchParams({ ...(search ? { search } : {}), ...(category ? { category } : {}) }).toString(), [search, category]);

  async function load() {
    const [rows, totals] = await Promise.all([
      api.get(`/ai/${activeTab}${query ? `?${query}` : ''}`),
      api.get('/ai/summary'),
    ]);
    setItems(rows);
    setSummary(totals);
  }

  useEffect(() => { load().catch((error) => setMessage(error.message)); }, [activeTab, query]);
  useEffect(() => { setSearch(''); setCategory(''); setForm(blank()); }, [activeTab]);

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  async function submit(event) {
    event.preventDefault();
    await api.post(`/ai/${activeTab}`, form);
    setForm(blank());
    setMessage('Conteúdo do Assistente IA salvo com sucesso.');
    await load();
  }
  async function copy(text) {
    await navigator.clipboard.writeText(text || '');
    setMessage('Texto copiado.');
  }

  const activeLabel = tabs.find(([key]) => key === activeTab)?.[1] || 'Assistente IA';

  return <section>
    <div className="page-header"><div><h2>Assistente IA BELLEART</h2><p>Banco de prompts, ideias e respostas para marketing odontológico ético e fácil de usar.</p></div><span className="badge">Fase 6</span></div>
    <div className="tab-bar">{tabs.map(([key, label]) => <button className={activeTab === key ? 'active' : ''} type="button" key={key} onClick={() => setActiveTab(key)}>{label}</button>)}</div>
    <div className="metrics-grid">{tabs.map(([key, label]) => <article className="metric-card" key={key}><span>{label}</span><strong>{summary[key] ?? 0}</strong></article>)}</div>
    {message && <p className="alert success">{message}</p>}
    <div className="search-card filters"><label>Buscar<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar em ${activeLabel}`} /></label><label>Categoria<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    {!readOnly && <form className="form-grid" onSubmit={submit}>{fields.map((field) => <label className={['prompt', 'content', 'notes'].includes(field) ? 'full' : ''} key={field}>{labels[field]}{field === 'category' ? <select value={form.category} onChange={(event) => update(field, event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select> : ['prompt', 'content', 'notes'].includes(field) ? <textarea required={field === 'content'} value={form[field]} onChange={(event) => update(field, event.target.value)} /> : <input required={field === 'title'} value={form[field]} onChange={(event) => update(field, event.target.value)} />}</label>)}<div className="full form-actions"><button type="submit">Adicionar ao Assistente IA</button></div></form>}
    <div className="marketing-list">{items.map((item) => <article className="card marketing-card" key={item.id}><div><span>{item.category}</span><strong className="record-title">{item.title}</strong></div>{item.prompt && <p><b>Prompt:</b> {item.prompt}</p>}<p><b>Conteúdo:</b> {item.content}</p>{item.cta && <p><b>CTA:</b> {item.cta}</p>}{item.notes && <p><b>Observações:</b> {item.notes}</p>}<button type="button" className="secondary" onClick={() => copy([item.prompt, item.content, item.cta].filter(Boolean).join('\n\n'))}>Copiar</button></article>)}{!items.length && <article className="card empty-state">Nenhum conteúdo encontrado.</article>}</div>
  </section>;
}

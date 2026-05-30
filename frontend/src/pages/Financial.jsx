import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const emptyForm = { patient_id: '', budget_id: '', type: 'receita', description: '', amount: '', due_date: '', payment_date: '', status: 'pendente' };
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Financial() {
  const [patients, setPatients] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, pending: 0, balance: 0 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    const [patientsData, budgetsData, recordsData, summaryData] = await Promise.all([api.get('/patients'), api.get('/budgets'), api.get('/financial'), api.get('/financial/summary')]);
    setPatients(patientsData); setBudgets(budgetsData); setRecords(recordsData); setSummary(summaryData);
  }
  useEffect(() => { loadData().catch((apiError) => setError(apiError.message)); }, []);
  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setMessage('');
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) { await api.put(`/financial/${editingId}`, payload); setMessage('Lançamento atualizado com sucesso.'); }
      else { await api.post('/financial', payload); setMessage('Lançamento cadastrado com sucesso.'); }
      setForm(emptyForm); setEditingId(null); await loadData();
    } catch (apiError) { setError(apiError.message); }
  }
  function startEdit(record) { setEditingId(record.id); setForm({ patient_id: record.patient_id || '', budget_id: record.budget_id || '', type: record.type, description: record.description, amount: record.amount, due_date: record.due_date || '', payment_date: record.payment_date || '', status: record.status }); }
  async function removeRecord(id) { if (!window.confirm('Deseja excluir este lançamento?')) return; await api.delete(`/financial/${id}`); await loadData(); }

  return (
    <section>
      <div className="page-header"><div><h2>Financeiro</h2><p>Receitas, despesas e resumo financeiro.</p></div></div>
      <div className="cards"><article className="card"><span>Receitas pagas</span><strong>{money(summary.income)}</strong></article><article className="card"><span>Despesas pagas</span><strong>{money(summary.expenses)}</strong></article><article className="card"><span>Pendente</span><strong>{money(summary.pending)}</strong></article><article className="card"><span>Saldo</span><strong>{money(summary.balance)}</strong></article></div>
      {message && <p className="alert success">{message}</p>}{error && <p className="alert error">{error}</p>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>Paciente<select name="patient_id" value={form.patient_id} onChange={updateField}><option value="">Sem paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label>
        <label>Orçamento<select name="budget_id" value={form.budget_id} onChange={updateField}><option value="">Sem orçamento</option>{budgets.map((budget) => <option key={budget.id} value={budget.id}>{budget.patient_name} - {budget.description}</option>)}</select></label>
        <label>Tipo<select name="type" value={form.type} onChange={updateField}><option value="receita">Receita</option><option value="despesa">Despesa</option></select></label>
        <label>Valor*<input type="number" step="0.01" min="0" name="amount" value={form.amount} onChange={updateField} required /></label>
        <label>Vencimento<input type="date" name="due_date" value={form.due_date} onChange={updateField} /></label>
        <label>Pagamento<input type="date" name="payment_date" value={form.payment_date} onChange={updateField} /></label>
        <label>Status<select name="status" value={form.status} onChange={updateField}><option value="pendente">Pendente</option><option value="pago">Pago</option><option value="cancelado">Cancelado</option></select></label>
        <label className="full">Descrição*<textarea name="description" value={form.description} onChange={updateField} required /></label>
        <div className="form-actions full"><button type="submit">{editingId ? 'Salvar alterações' : 'Cadastrar lançamento'}</button>{editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</button>}</div>
      </form>
      <div className="table-wrapper"><table><thead><tr><th>Descrição</th><th>Paciente</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td>{record.description}</td><td>{record.patient_name || '-'}</td><td>{record.type}</td><td>{money(record.amount)}</td><td><span className="badge">{record.status}</span></td><td><button type="button" onClick={() => startEdit(record)}>Editar</button><button type="button" className="danger" onClick={() => removeRecord(record.id)}>Excluir</button></td></tr>)}</tbody></table></div>
    </section>
  );
}

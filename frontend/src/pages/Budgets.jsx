import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const statuses = ['Pendente', 'Aprovado', 'Em Tratamento', 'Concluído', 'Cancelado'];
const emptyForm = { patient_id: '', description: '', total_amount: '', status: 'Pendente' };

export default function Budgets() {
  const [patients, setPatients] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    const [patientsData, budgetsData] = await Promise.all([api.get('/patients'), api.get('/budgets')]);
    setPatients(patientsData);
    setBudgets(budgetsData);
  }

  useEffect(() => { loadData().catch((apiError) => setError(apiError.message)); }, []);

  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }); }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(''); setMessage('');
    try {
      const payload = { ...form, total_amount: Number(form.total_amount) };
      if (editingId) {
        await api.put(`/budgets/${editingId}`, payload);
        setMessage('Orçamento atualizado com sucesso.');
      } else {
        await api.post('/budgets', payload);
        setMessage('Orçamento cadastrado com sucesso.');
      }
      setForm(emptyForm); setEditingId(null); await loadData();
    } catch (apiError) { setError(apiError.message); }
  }

  function startEdit(budget) {
    setEditingId(budget.id);
    setForm({ patient_id: budget.patient_id, description: budget.description, total_amount: budget.total_amount, status: budget.status });
  }

  async function removeBudget(id) {
    if (!window.confirm('Deseja excluir este orçamento?')) return;
    await api.delete(`/budgets/${id}`); await loadData();
  }

  return (
    <section>
      <div className="page-header"><div><h2>Orçamentos</h2><p>Controle propostas e tratamentos aprovados.</p></div></div>
      {message && <p className="alert success">{message}</p>}{error && <p className="alert error">{error}</p>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>Paciente*<select name="patient_id" value={form.patient_id} onChange={updateField} required><option value="">Selecione</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label>
        <label>Valor total*<input type="number" step="0.01" min="0" name="total_amount" value={form.total_amount} onChange={updateField} required /></label>
        <label>Status<select name="status" value={form.status} onChange={updateField}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="full">Descrição*<textarea name="description" value={form.description} onChange={updateField} required /></label>
        <div className="form-actions full"><button type="submit">{editingId ? 'Salvar alterações' : 'Cadastrar orçamento'}</button>{editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</button>}</div>
      </form>
      <div className="table-wrapper"><table><thead><tr><th>Paciente</th><th>Descrição</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>{budgets.map((budget) => <tr key={budget.id}><td>{budget.patient_name}</td><td>{budget.description}</td><td>{Number(budget.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td><span className="badge">{budget.status}</span></td><td><button type="button" onClick={() => startEdit(budget)}>Editar</button><button type="button" className="danger" onClick={() => removeBudget(budget.id)}>Excluir</button></td></tr>)}</tbody></table></div>
    </section>
  );
}

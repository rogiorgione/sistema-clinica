import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const emptyForm = { name: '', cpf: '', phone_whatsapp: '', email: '', birth_date: '', notes: '' };

function normalizeSearchValue(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  async function loadPatients() {
    setPatients(await api.get('/patients'));
  }

  useEffect(() => {
    loadPatients().catch((apiError) => setError(apiError.message));
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  const filteredPatients = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(searchTerm.trim());
    const searchDigits = normalizedSearch.replace(/\D/g, '');

    if (!normalizedSearch) {
      return patients;
    }

    return patients.filter((patient) => {
      const searchableFields = [patient.name, patient.cpf, patient.phone_whatsapp];

      return searchableFields.some((field) => {
        const normalizedField = normalizeSearchValue(field);
        const fieldDigits = normalizedField.replace(/\D/g, '');

        return (
          normalizedField.includes(normalizedSearch) || (searchDigits && fieldDigits.includes(searchDigits))
        );
      });
    });
  }, [patients, searchTerm]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, form);
        setMessage('Paciente atualizado com sucesso.');
      } else {
        await api.post('/patients', form);
        setMessage('Paciente cadastrado com sucesso.');
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadPatients();
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  function startEdit(patient) {
    setEditingId(patient.id);
    setForm({
      name: patient.name || '',
      cpf: patient.cpf || '',
      phone_whatsapp: patient.phone_whatsapp || '',
      email: patient.email || '',
      birth_date: patient.birth_date || '',
      notes: patient.notes || '',
    });
  }

  async function removePatient(id) {
    if (!window.confirm('Deseja excluir este paciente?')) return;
    await api.delete(`/patients/${id}`);
    await loadPatients();
  }

  return (
    <section>
      <div className="page-header">
        <div><h2>Pacientes</h2><p>Cadastro com CPF obrigatório e único.</p></div>
      </div>
      {message && <p className="alert success">{message}</p>}
      {error && <p className="alert error">{error}</p>}
      <div className="search-card">
        <label>
          Buscar paciente
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Digite nome, CPF ou Telefone/WhatsApp"
            aria-label="Buscar paciente por nome, CPF ou Telefone/WhatsApp"
          />
        </label>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>Nome*<input name="name" value={form.name} onChange={updateField} required /></label>
        <label>CPF*<input name="cpf" value={form.cpf} onChange={updateField} required /></label>
        <label>Telefone/WhatsApp<input name="phone_whatsapp" value={form.phone_whatsapp} onChange={updateField} /></label>
        <label>E-mail<input type="email" name="email" value={form.email} onChange={updateField} /></label>
        <label>Nascimento<input type="date" name="birth_date" value={form.birth_date} onChange={updateField} /></label>
        <label className="full">Observações<textarea name="notes" value={form.notes} onChange={updateField} /></label>
        <div className="form-actions full">
          <button type="submit">{editingId ? 'Salvar alterações' : 'Cadastrar paciente'}</button>
          {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</button>}
        </div>
      </form>
      <div className="table-wrapper">
        <table><thead><tr><th>Nome</th><th>CPF</th><th>Telefone/WhatsApp</th><th>E-mail</th><th>Ações</th></tr></thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => <tr key={patient.id}><td>{patient.name}</td><td>{patient.cpf}</td><td>{patient.phone_whatsapp}</td><td>{patient.email}</td><td><button type="button" onClick={() => startEdit(patient)}>Editar</button><button type="button" className="danger" onClick={() => removePatient(patient.id)}>Excluir</button></td></tr>)
            ) : (
              <tr>
                <td className="empty-state" colSpan="5">Nenhum paciente encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

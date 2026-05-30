import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const emptyForm = { patient_id: '', appointment_date: '', appointment_time: '', procedure: '', status: 'agendado', notes: '' };

export default function Appointments() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    const [patientsData, appointmentsData] = await Promise.all([api.get('/patients'), api.get('/appointments')]);
    setPatients(patientsData);
    setAppointments(appointmentsData);
  }
  useEffect(() => { loadData().catch((apiError) => setError(apiError.message)); }, []);
  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setMessage('');
    try {
      if (editingId) { await api.put(`/appointments/${editingId}`, form); setMessage('Agendamento atualizado com sucesso.'); }
      else { await api.post('/appointments', form); setMessage('Agendamento cadastrado com sucesso.'); }
      setForm(emptyForm); setEditingId(null); await loadData();
    } catch (apiError) { setError(apiError.message); }
  }
  function startEdit(appointment) { setEditingId(appointment.id); setForm({ patient_id: appointment.patient_id, appointment_date: appointment.appointment_date, appointment_time: appointment.appointment_time, procedure: appointment.procedure, status: appointment.status, notes: appointment.notes || '' }); }
  async function removeAppointment(id) { if (!window.confirm('Deseja excluir este agendamento?')) return; await api.delete(`/appointments/${id}`); await loadData(); }

  return (
    <section>
      <div className="page-header"><div><h2>Agenda</h2><p>Organize consultas e procedimentos do dia a dia.</p></div></div>
      {message && <p className="alert success">{message}</p>}{error && <p className="alert error">{error}</p>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>Paciente*<select name="patient_id" value={form.patient_id} onChange={updateField} required><option value="">Selecione</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label>
        <label>Data*<input type="date" name="appointment_date" value={form.appointment_date} onChange={updateField} required /></label>
        <label>Horário*<input type="time" name="appointment_time" value={form.appointment_time} onChange={updateField} required /></label>
        <label>Status<select name="status" value={form.status} onChange={updateField}><option value="agendado">Agendado</option><option value="concluido">Concluído</option><option value="cancelado">Cancelado</option></select></label>
        <label className="full">Procedimento*<input name="procedure" value={form.procedure} onChange={updateField} required /></label>
        <label className="full">Observações<textarea name="notes" value={form.notes} onChange={updateField} /></label>
        <div className="form-actions full"><button type="submit">{editingId ? 'Salvar alterações' : 'Cadastrar agendamento'}</button>{editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</button>}</div>
      </form>
      <div className="table-wrapper"><table><thead><tr><th>Data</th><th>Horário</th><th>Paciente</th><th>Procedimento</th><th>Status</th><th>Ações</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}><td>{appointment.appointment_date}</td><td>{appointment.appointment_time}</td><td>{appointment.patient_name}</td><td>{appointment.procedure}</td><td><span className="badge">{appointment.status}</span></td><td><button type="button" onClick={() => startEdit(appointment)}>Editar</button><button type="button" className="danger" onClick={() => removeAppointment(appointment.id)}>Excluir</button></td></tr>)}</tbody></table></div>
    </section>
  );
}

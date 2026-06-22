import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const tabs = [
  ['secretary', 'Secretária IA'],
  ['scheduling', 'Agenda automática'],
  ['executive', 'Painel executivo'],
  ['financial', 'Financeiro avançado'],
  ['integrations', 'Integrações oficiais'],
];

function Metric({ label, value }) {
  return <article className="metric-card"><span>{label}</span><strong>{value ?? 0}</strong></article>;
}

function CardList({ items, render, empty = 'Nenhum item encontrado.' }) {
  return <div className="marketing-list">{items?.length ? items.map(render) : <article className="card empty-state">{empty}</article>}</div>;
}

export default function PremiumOS() {
  const [activeTab, setActiveTab] = useState('secretary');
  const [data, setData] = useState({});
  const [message, setMessage] = useState('');

  async function load() {
    setMessage('');
    const map = {
      secretary: '/premium-os/virtual-secretary',
      scheduling: '/premium-os/automatic-scheduling',
      executive: '/premium-os/executive-panel',
      financial: '/premium-os/advanced-financial',
      integrations: '/premium-os/integrations',
    };
    setData(await api.get(map[activeTab]));
  }

  useEffect(() => { load().catch((error) => setMessage(error.message)); }, [activeTab]);

  return <section>
    <div className="page-header">
      <div><h2>BELLEART OS Premium</h2><p>Central incremental para IA comercial, agenda automática, gestão executiva, financeiro avançado e integrações oficiais.</p></div>
      <span className="badge">Fases 10–20</span>
    </div>
    <div className="tab-bar">{tabs.map(([key, label]) => <button type="button" className={activeTab === key ? 'active' : ''} key={key} onClick={() => setActiveTab(key)}>{label}</button>)}</div>
    {message && <p className="alert error">{message}</p>}

    {activeTab === 'secretary' && <>
      <div className="metrics-grid"><Metric label="Leads quentes" value={data.hotLeads?.length} /><Metric label="Leads priorizados" value={data.prioritizedLeads?.length} /><Metric label="Pacientes esquecidos" value={data.forgottenPatients?.length} /></div>
      <h3>Prioridade comercial</h3>
      <CardList items={data.prioritizedLeads} render={(lead) => <article className="card marketing-card" key={lead.id}><div><span>{lead.temperature} • score {lead.score}</span><strong className="record-title">{lead.name}</strong></div><p><b>Próximo contato:</b> {lead.recommended_contact_date} — {lead.next_action}</p><p><b>WhatsApp sugerido:</b> {lead.suggested_response}</p></article>} />
      <h3>Pacientes esquecidos</h3>
      <CardList items={data.forgottenPatients} render={(patient) => <article className="card marketing-card" key={patient.id}><strong className="record-title">{patient.name}</strong><p><b>Última visita:</b> {patient.last_appointment || 'sem histórico de agenda'}</p><p>{patient.suggested_message}</p></article>} />
    </>}

    {activeTab === 'scheduling' && <>
      <div className="metrics-grid"><Metric label="Próximas consultas" value={data.upcoming?.length} /><Metric label="Faltosos" value={data.missed?.length} /><Metric label="Fila de encaixe" value={data.waitlist?.length} /></div>
      <article className="card"><strong className="record-title">Google Calendar</strong><p>Integração futura preparada via {data.googleCalendar?.provider}, usando {data.googleCalendar?.auth} e sem armazenamento de senhas.</p></article>
      <h3>Confirmações e lembretes</h3>
      <CardList items={data.upcoming} render={(item) => <article className="card marketing-card" key={item.id}><strong className="record-title">{item.patient_name}</strong><p><b>Comparecimento previsto:</b> {item.attendance_probability}%</p><p>{item.confirmation_message}</p><p>{item.reminder_message}</p></article>} />
      <h3>Faltosos e reagendamento</h3>
      <CardList items={data.missed} render={(item) => <article className="card marketing-card" key={item.id}><strong className="record-title">{item.patient_name}</strong><p>{item.reschedule_message}</p><p><b>Ação:</b> {item.suggested_action}</p></article>} />
    </>}

    {activeTab === 'executive' && <>
      <div className="metrics-grid"><Metric label="ROI marketing" value={`${data.marketing?.roi ?? 0}%`} /><Metric label="CPL" value={`R$ ${data.marketing?.cpl ?? 0}`} /><Metric label="Conversão" value={`${data.commercial?.conversion ?? 0}%`} /><Metric label="Ticket médio" value={`R$ ${data.commercial?.averageTicket ?? 0}`} /><Metric label="Faturamento" value={`R$ ${data.clinic?.revenue ?? 0}`} /><Metric label="Inadimplência" value={`R$ ${data.clinic?.overdue ?? 0}`} /></div>
      <CardList items={data.marketing?.campaigns} render={(campaign) => <article className="card marketing-card" key={campaign.name}><strong className="record-title">{campaign.name}</strong><p>{campaign.platform} • {campaign.status}</p><p>Orçado R$ {campaign.budget} • Investido R$ {campaign.spent}</p></article>} />
    </>}

    {activeTab === 'financial' && <>
      <div className="metrics-grid"><Metric label="Entradas" value={`R$ ${data.cashFlow?.income ?? 0}`} /><Metric label="Saídas" value={`R$ ${data.cashFlow?.expenses ?? 0}`} /><Metric label="Saldo" value={`R$ ${data.cashFlow?.balance ?? 0}`} /><Metric label="Previsão 30 dias" value={`R$ ${data.forecast?.next30DaysRevenue ?? 0}`} /><Metric label="Inadimplência" value={`${data.indicators?.delinquencyRate ?? 0}%`} /></div>
      <CardList items={data.goals} render={(goal) => <article className="card marketing-card" key={goal.id}><strong className="record-title">{goal.title}</strong><p>Meta R$ {goal.target_amount} até {goal.target_date} • status {goal.status}</p></article>} />
    </>}

    {activeTab === 'integrations' && <CardList items={data} render={(integration) => <article className="card marketing-card" key={integration.provider}><span>{integration.status}</span><strong className="record-title">{integration.provider}</strong><p><b>Escopos:</b> {integration.scopes || 'definir no OAuth oficial'}</p><p>{integration.notes}</p></article>} />}
  </section>;
}

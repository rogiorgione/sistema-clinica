import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const configs = {
  clinical: { title: 'Central Clínica', intro: 'Ficha clínica completa, odontograma, evolução, anamnese, plano de tratamento, documentos clínicos e histórico.', base: '/clinical', tabs: [['dashboard','Resumo'], ['records','Ficha Clínica'], ['odontogram','Odontograma'], ['evolutions','Evolução'], ['anamnesis','Anamnese'], ['treatment-plans','Plano de Tratamento'], ['photos','Fotos'], ['attachments','Anexos'], ['prescriptions','Receitas'], ['certificates','Atestados'], ['consent-terms','Termos'], ['history','Histórico']] },
  enterpriseCrm: { title: 'CRM Kanban Enterprise', intro: 'Pipeline visual com temperatura, score IA, origem, campanha, responsável, próximo contato, valor previsto e tarefas.', base: '/enterprise-crm', tabs: [['dashboard','Kanban'], ['leads','Leads'], ['stages','Etapas'], ['tasks','Tarefas'], ['scores','Scores'], ['sources','Origens'], ['campaigns','Campanhas'], ['history','Histórico']] },
  secretary: { title: 'Secretária Virtual IA', intro: 'Prioridades do dia, ligações, pacientes esquecidos, confirmações, faltosos, reagendamentos e oportunidades.', base: '/secretary', tabs: [['dashboard','Resumo'], ['priorities','Prioridades'], ['tasks','Tarefas'], ['alerts','Alertas'], ['suggestions','Sugestões'], ['call-queue','Ligações'], ['followups','Follow-ups']] },
  belleartAi: { title: 'BELLEART AI', intro: 'Agentes internos para marketing, comercial, WhatsApp, financeiro, executivo, relatórios e prompts.', base: '/ai', tabs: [['agents','Marketing'], ['tasks','Comercial'], ['outputs','WhatsApp'], ['recommendations','Financeiro'], ['lead-scores','Executivo'], ['reports','Relatórios'], ['prompts','Prompts'], ['content','Conteúdo']] },
  automations: { title: 'Automações Inteligentes', intro: 'Motor preparado para gatilhos, condições, ações, fila e logs sem conectar serviços externos sem autorização.', base: '/automations', tabs: [['dashboard','Resumo'], ['rules','Regras'], ['triggers','Gatilhos'], ['conditions','Condições'], ['actions','Ações'], ['queue','Fila'], ['logs','Logs']] },
  backupSecurity: { title: 'Backup e Segurança', intro: 'Backup manual/automático preparado, exportações, logs, auditoria, eventos de segurança e saúde do sistema.', base: '', tabs: [['backup/jobs','Backups'], ['backup/files','Arquivos'], ['backup/logs','Logs'], ['system/health','Saúde'], ['security/events','Segurança'], ['audit/events','Auditoria']] },
};

function readPayload(item) {
  try { return JSON.parse(item.payload || '{}'); } catch { return {}; }
}

export default function EnterpriseModule({ type, readOnly = false }) {
  const config = configs[type];
  const [activeTab, setActiveTab] = useState(config.tabs[0][0]);
  const [items, setItems] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Preparado');
  const [error, setError] = useState('');

  const endpoint = useMemo(() => `${config.base}/${activeTab}`.replace('//', '/'), [config.base, activeTab]);
  const isDashboard = activeTab === 'dashboard';

  async function load() {
    setError('');
    const data = await api.get(endpoint);
    if (isDashboard) { setDashboard(data); setItems([]); } else { setItems(Array.isArray(data) ? data : []); setDashboard(null); }
  }

  useEffect(() => { load().catch((loadError) => setError(loadError.message)); }, [endpoint]);

  async function submit(event) {
    event.preventDefault();
    await api.post(endpoint, { title, status, source: 'BELLEART OS Enterprise', stores_social_passwords: false, official_api_only: true });
    setTitle(''); setStatus('Preparado'); await load();
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>{config.title}</h2>
          <p>{config.intro}</p>
        </div>
      </div>
      <div className="tab-bar">
        {config.tabs.map(([id, label]) => <button type="button" key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>{label}</button>)}
      </div>
      {error && <p className="alert error">{error}</p>}
      {dashboard && <pre className="dashboard-json">{JSON.stringify(dashboard, null, 2)}</pre>}
      {!isDashboard && !readOnly && <form className="search-card inline-form" onSubmit={submit}>
        <label>Novo registro<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`Adicionar em ${config.title}`} required /></label>
        <label>Status<input value={status} onChange={(event) => setStatus(event.target.value)} /></label>
        <button type="submit">Adicionar</button>
      </form>}
      {!isDashboard && <div className="cards kanban-grid">
        {items.length ? items.map((item) => {
          const payload = readPayload(item);
          return <article className="card" key={item.id}><span>{item.status}</span><strong className="record-title">{item.title}</strong>{payload.official_api_only && <small>Integração preparada somente por OAuth/API oficial.</small>}<small>{new Date(item.updated_at).toLocaleString('pt-BR')}</small></article>;
        }) : <article className="card empty-state">Nenhum registro. Módulo seguro e pronto para uso.</article>}
      </div>}
    </section>
  );
}

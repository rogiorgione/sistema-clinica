import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const modules = [
  ['Central de Pacientes', 'Ficha completa, odontograma, fotos, documentos, histórico clínico, tratamentos e evolução.'],
  ['Central de Agendas', 'Visões diária, semanal e mensal com encaixes, confirmação, faltosos e reagendamento.'],
  ['CRM Visual', 'Kanban profissional com drag and drop para as etapas comerciais.'],
  ['Financeiro Enterprise', 'DRE, fluxo de caixa, contas, metas, parcelamentos, inadimplência e gráficos.'],
  ['Central de Marketing', 'Calendário, campanhas, ROI, CPL e métricas de Instagram, TikTok, Facebook e WhatsApp.'],
  ['BELLEART AI', 'Posts, reels, stories, objeções, campanhas, ligações sugeridas e classificação de leads.'],
  ['Automações', 'Tarefas automáticas, lembretes, follow-ups, notificações e reativações.'],
  ['Dashboards', 'Clínica, Marketing, CRM, Financeiro, WhatsApp e Premium.'],
  ['Backup', 'Backup automático, restauração e exportação preservando SQLite.'],
  ['Versão Comercial', 'Arquitetura futura para multiusuário, multiclínicas, assinatura e licença SaaS.'],
];

function money(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function Enterprise() {
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState('');
  const leadsByStage = useMemo(() => Object.fromEntries((summary?.stages || []).map((stage) => [stage, summary?.crm?.by_stage?.find((item) => item.stage === stage)?.total || 0])), [summary]);

  async function load() {
    try { setSummary(await api.get('/enterprise/summary')); }
    catch (error) { setMessage(error.message || 'Falha ao carregar Enterprise.'); }
  }

  async function createBackup() {
    try {
      await api.post('/enterprise/backups', { title: `Backup manual ${new Date().toISOString()}` });
      setMessage('Backup registrado com segurança.');
      await load();
    } catch (error) { setMessage(error.message || 'Não foi possível registrar backup.'); }
  }

  async function handleDrop(event, stage) {
    const id = event.dataTransfer.getData('lead-id');
    if (!id) return;
    try {
      await api.put(`/enterprise/crm/leads/${id}/stage`, { stage });
      await load();
    } catch (error) { setMessage(error.message || 'Falha ao mover lead.'); }
  }

  useEffect(() => { load(); }, []);

  if (!summary) return <article className="card empty-state">Carregando Fase Enterprise...</article>;

  return <section className="enterprise-page">
    <div className="page-header enterprise-hero"><div><span className="eyebrow">BELLEART OS ENTERPRISE</span><h2>Fase Enterprise</h2><p>Plataforma profissional aditiva: preserva SQLite, pacientes, agenda, financeiro, CRM, marketing, WhatsApp e dados existentes.</p></div><button type="button" onClick={createBackup}>Registrar backup</button></div>
    {message && <p className={message.includes('segurança') ? 'alert success' : 'alert error'}>{message}</p>}
    <div className="metrics-grid enterprise-metrics">
      <article className="metric-card"><span>Pacientes</span><strong>{summary.clinic.patients}</strong></article>
      <article className="metric-card"><span>Consultas</span><strong>{summary.clinic.appointments}</strong></article>
      <article className="metric-card"><span>Conversão CRM</span><strong>{summary.crm.conversion_rate}%</strong></article>
      <article className="metric-card"><span>Saldo</span><strong>{money(summary.financial.balance)}</strong></article>
      <article className="metric-card"><span>CPL</span><strong>{money(summary.marketing.cpl)}</strong></article>
      <article className="metric-card"><span>Automações</span><strong>{summary.automations.active_rules}</strong></article>
    </div>

    <div className="enterprise-grid">{modules.map(([title, description]) => <article className="card enterprise-module" key={title}><h3>{title}</h3><p>{description}</p><span className="badge">Aditivo e pronto para evoluir</span></article>)}</div>

    <article className="card"><h3>CRM visual — Kanban drag and drop</h3><div className="kanban-board enterprise-kanban">{summary.stages.map((stage) => <section className="kanban-column" key={stage} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, stage)}><h3>{stage}</h3><strong>{leadsByStage[stage]} lead(s)</strong>{(summary.crm.leads || []).filter((item) => item.stage === stage).map((item) => <div className="lead-card card" draggable onDragStart={(event) => event.dataTransfer.setData('lead-id', item.id)} key={item.id}><strong>{item.name}</strong><p>{item.interest || 'Sem interesse informado'}</p><small>{money(item.estimated_value)}</small></div>)}<small>Solte leads aqui para atualizar etapa.</small></section>)}</div></article>

    <div className="enterprise-grid"><article className="card"><h3>DRE e fluxo</h3><p>Receitas: {money(summary.financial.income)}</p><p>Despesas: {money(summary.financial.expenses)}</p><p>Mês DRE: {summary.financial.dre_month}</p></article><article className="card"><h3>Backups</h3>{summary.backups.map((backup) => <p key={backup.id}><b>{backup.title}</b> — {backup.status}</p>)}</article></div>
  </section>;
}

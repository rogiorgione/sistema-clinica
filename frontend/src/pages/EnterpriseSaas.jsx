import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const sections = [
  ['clinical', 'Central Clínica', '/clinical/records', ['Ficha clínica', 'Odontograma', 'Evolução', 'Anamnese', 'Plano de tratamento', 'Fotos e anexos', 'Receitas e atestados', 'Termos']],
  ['agenda', 'Central de Agenda', '/agenda/day', ['Dia', 'Semana', 'Mês', 'Encaixes', 'Fila de espera', 'Confirmações', 'Faltosos', 'Google Calendar OAuth']],
  ['crm', 'Central Comercial', '/enterprise-crm/dashboard', ['Kanban', 'Temperatura', 'Prioridade', 'Campanha', 'Responsável', 'Próximo contato', 'Valor previsto', 'WhatsApp inteligente']],
  ['finance', 'Central Financeira', '/finance/dashboard', ['DRE', 'Fluxo de caixa', 'A pagar', 'A receber', 'Inadimplência', 'Metas', 'Comissões', 'Produção']],
  ['marketing', 'Central de Marketing', '/marketing/posts', ['Posts', 'Stories', 'Reels', 'Carrosséis', 'Legendas', 'Hashtags', 'ROI', 'Rankings']],
  ['whatsapp', 'Central WhatsApp', '/whatsapp-business/settings', ['Conversas', 'Inbox', 'Templates', 'Objeções', 'Follow-ups', 'Etiquetas', 'Responsáveis', 'API oficial futura']],
  ['ai', 'BELLEART AI', '/ai/prompts', ['Marketing', 'Comercial', 'WhatsApp', 'Financeiro', 'Gestão', 'Relatórios', 'Biblioteca de prompts']],
  ['documents', 'Documentos', '/documents/templates', ['Contratos', 'Termos', 'Consentimentos', 'Recibos', 'PDFs', 'Atestados', 'Receitas', 'Assinatura futura']],
  ['automations', 'Automações', '/automations/rules', ['Lead novo', 'Follow-up', 'Faltoso', 'Parcela atrasada', 'Lead sem resposta', 'Campanha para CRM']],
  ['reports', 'Relatórios', '/reports/templates', ['Clínicos', 'Financeiros', 'Comerciais', 'Marketing', 'WhatsApp', 'Pacientes', 'Profissionais']],
  ['backup', 'Backup & Segurança', '/system/health', ['Backup manual', 'Backup automático', 'Exportação SQLite', 'CSV', 'Auditoria', 'Status do sistema']],
  ['saas', 'SaaS / Multi-clínicas', '/saas/plans', ['Clínicas', 'Unidades', 'Planos', 'Assinaturas', 'Licenças', 'Limites', 'Billing']],
];

export default function EnterpriseSaas() {
  const [active, setActive] = useState(sections[0][0]);
  const [data, setData] = useState(null);
  const section = useMemo(() => sections.find(([key]) => key === active) || sections[0], [active]);

  useEffect(() => {
    let alive = true;
    setData(null);
    api.get(section[2]).then((json) => { if (alive) setData(json); }).catch(() => { if (alive) setData([]); });
    return () => { alive = false; };
  }, [section]);

  const items = Array.isArray(data) ? data : data && typeof data === 'object' ? Object.entries(data).flatMap(([, value]) => Array.isArray(value) ? value : []) : [];

  return <div className="enterprise-saas-page">
    <header className="page-hero">
      <span className="eyebrow">BELLEART OS Enterprise SaaS</span>
      <h1>Plataforma local preparada para nuvem, multi-clínicas e assinatura</h1>
      <p>Estrutura aditiva preservando SQLite, pacientes, agenda, financeiro, marketing, CRM, WhatsApp, documentos, usuários, configurações, auditoria e dados existentes.</p>
    </header>
    <div className="tabs-grid">
      {sections.map(([key, label]) => <button className={key === active ? 'active' : ''} key={key} onClick={() => setActive(key)}>{label}</button>)}
    </div>
    <section className="enterprise-panel">
      <div>
        <h2>{section[1]}</h2>
        <p>APIs autenticadas em <code>/api{section[2]}</code>, tabelas criadas com <code>CREATE TABLE IF NOT EXISTS</code> e integrações externas preparadas apenas por OAuth/API oficial.</p>
        <div className="feature-grid">{section[3].map((item) => <article key={item}><strong>{item}</strong><span>Preparado</span></article>)}</div>
      </div>
      <aside>
        <h3>Dados recentes</h3>
        <p>{data === null ? 'Carregando...' : `${items.length} registros carregados sem apagar dados.`}</p>
        <ul>{items.slice(0, 6).map((item) => <li key={`${item.id}-${item.title}`}>{item.title || item.name || item.status || `Registro ${item.id}`}</li>)}</ul>
      </aside>
    </section>
    <section className="assurance-card">
      <strong>Garantias do bloco Enterprise</strong>
      <p>Sem senhas de Instagram, Facebook, TikTok, WhatsApp ou Google. Tokens reais devem ficar em cofre/armazenamento seguro no backend e nunca no frontend.</p>
    </section>
  </div>;
}

export const groups = [
  { label: 'Visão Geral', items: [['dashboard','Dashboard'], ['executive','Painel Executivo'], ['notifications','Notificações']] },
  { label: 'Clínica', items: [['patients','Pacientes'], ['appointments','Agenda'], ['budgets','Orçamentos'], ['documents','Documentos'], ['implant-crm','CRM de Implantes'], ['referrals','Indicações'], ['reactivation','Reativação']] },
  { label: 'Marketing & Vendas', items: [['marketing','Marketing'], ['campaigns','Campanhas'], ['crm','CRM'], ['whatsapp','WhatsApp Inteligente'], ['tasks','Tarefas Comerciais'], ['captions','Banco de Legendas'], ['content-calendar','Calendário de Conteúdo'], ['ai-assistant','Assistente IA'], ['reels','Roteiros Reels'], ['stories','Banco de Stories'], ['metrics','Métricas Sociais']] },
  { label: 'Gestão', items: [['financial','Financeiro'], ['implant-financial','Financeiro de Implantes'], ['reports','Relatórios'], ['automations','Automações']] },
  { label: 'Administração', items: [['settings','Configurações'], ['backups','Gestão & Backup'], ['users','Usuários'], ['audit','Auditoria'], ['profile','Perfil']] },
];
export const paths = Object.fromEntries(groups.flatMap(g => g.items));
export function allowed(item, user) {
  if (!user) return false; if (user.role === 'administrador' || item === 'profile' || item === 'dashboard') return true;
  const map = { dentista:['patients','appointments','budgets','documents','implant-crm','financial'], recepcao:['patients','appointments','whatsapp','tasks','notifications'], financeiro:['financial','implant-financial','reports','documents'], marketing:['marketing','campaigns','crm','whatsapp','captions','content-calendar','ai-assistant','reels','executive','tasks'], leitura:groups.flatMap(g=>g.items.map(i=>i[0])) };
  return (map[user.role] || []).includes(item);
}

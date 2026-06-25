# BELLEART OS

Sistema integrado para clínicas odontológicas, composto por frontend React/Vite, API Node.js/Express e banco de dados SQLite.

## Requisitos

- Node.js 18 ou superior;
- npm (instalado junto com o Node.js);
- Windows para usar o inicializador `ABRIR_BELLEART_OS.bat`.

## Estrutura do projeto

```text
.
├── ABRIR_BELLEART_OS.bat  # inicialização automática no Windows
├── backend/
│   ├── data/              # banco clinic.db local (não versionado)
│   ├── src/               # API, autenticação, rotas e banco
│   └── test/              # testes nativos do Node.js
└── frontend/
    └── src/
        ├── api/           # cliente HTTP
        ├── components/    # layout e navegação
        └── pages/         # telas do sistema
```

O banco SQLite é criado e atualizado de forma incremental. A inicialização não apaga nem recria os dados existentes.

## Execução rápida no Windows

1. Instale o [Node.js](https://nodejs.org/) 18 ou superior.
2. Dê dois cliques em `ABRIR_BELLEART_OS.bat`.
3. Aguarde a abertura do navegador em `http://localhost:5173`.

O arquivo instala dependências ausentes, abre o backend e o frontend em terminais separados e inicia o navegador automaticamente.

## Instalação e execução manual

Na raiz do projeto, instale as dependências:

```bash
npm install --prefix backend
npm install --prefix frontend
```

Inicie o backend:

```bash
npm start --prefix backend
```

Em outro terminal, inicie o frontend:

```bash
npm run dev --prefix frontend
```

Endereços locais:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001/api`
- Saúde da API: `http://localhost:3001/api/health`

## Primeiro acesso

- E-mail: `admin@belleart.local`
- Senha inicial: `admin123`

O administrador inicial só é criado quando ainda não existe. Reiniciar o sistema não substitui usuários nem dados já cadastrados.

Para definir credenciais seguras antes da primeira inicialização:

### Windows (Prompt de Comando)

```bat
set ADMIN_PASSWORD=uma-senha-forte
set AUTH_SECRET=um-segredo-longo-e-aleatorio
```

### Linux/macOS

```bash
export ADMIN_PASSWORD='uma-senha-forte'
export AUTH_SECRET='um-segredo-longo-e-aleatorio'
```

## BELLEART Marketing AI - Fase 1

A Fase 1 transforma o BELLEART OS em uma base operacional de marketing odontológico. Ao iniciar o backend, o SQLite cria tabelas novas com `CREATE TABLE IF NOT EXISTS` e popula um planejamento inicial sem apagar dados existentes.

Módulos disponíveis no menu **Marketing & Vendas**:

- **Calendário de Conteúdo:** visão mensal/semanal, data de publicação, canal, formato, categoria e status `Pendente`, `Agendado` ou `Publicado`.
- **Banco de Legendas:** categorias Implantes, Prótese Protocolo, Ortodontia, Botox, Harmonização e Clareamento, com busca, filtro, CTA, hashtags e botão para copiar.
- **Biblioteca de Reels:** roteiro, gancho, CTA, duração e categoria.
- **Banco de Stories:** ideias para Bastidores, Promoções, Autoridade e Depoimentos.
- **Planejamento de 30 dias:** seed inicial com 30 Reels, 90 Stories e 30 legendas para acelerar a operação.
- **Painel de Métricas:** estrutura para Instagram, TikTok, Facebook e WhatsApp com alcance, visualizações, seguidores, curtidas e compartilhamentos.
- **CRM Comercial:** etapas Novo Lead, Interessado, Avaliação Marcada, Negociação, Fechado e Perdido.
- **Agenda Comercial:** próximos contatos, canal, motivo, status e observações.
- **WhatsApp Inteligente:** mensagens para Implantes, Ortodontia, Prótese, Reativação e Pós-operatório.
- **Assistente IA de Marketing:** área prática para criar e armazenar ideias de Reels, legendas, stories, hashtags e carrosséis usando modelos simples editáveis.

Principais rotas da API autenticada:

```text
GET  /api/marketing-ai/summary
GET  /api/marketing-ai/:resource
POST /api/marketing-ai/:resource
PUT  /api/marketing-ai/:resource/:id
```

Recursos aceitos em `:resource`: `calendar`, `captions`, `reels`, `stories`, `metrics`, `crm`, `agenda` e `whatsapp`.


## BELLEART Marketing AI - Fase 2

A Fase 2 adiciona um CRM comercial completo para captar, acompanhar e converter leads de **implantes**, **ortodontia**, **prótese** e **estética**. As alterações no SQLite são aditivas: novas colunas são incluídas com `ALTER TABLE` apenas quando ainda não existem, preservando os leads já cadastrados.

Recursos principais no menu **Marketing & Vendas > CRM**:

- **Kanban de leads:** etapas Novo lead, Interessado, Avaliação marcada, Negociação, Fechado e Perdido.
- **Cadastro de lead:** nome, telefone/WhatsApp, interesse, origem, campanha, status, próximo contato e observações.
- **Botão WhatsApp:** abre a conversa com mensagem pronta, registra o último contato e atualiza automaticamente o próximo contato.
- **Agenda comercial:** separa leads para ligar hoje, leads atrasados e retornos futuros.
- **Dashboard comercial:** total de leads, avaliações marcadas, fechados, perdidos e taxa de conversão.

Rotas específicas da API autenticada para a Fase 2:

```text
GET  /api/marketing-ai/crm/dashboard
GET  /api/marketing-ai/crm/agenda
POST /api/marketing-ai/crm/:id/whatsapp-contact
```

As rotas genéricas `GET`, `POST` e `PUT` de `/api/marketing-ai/crm` continuam disponíveis para listar, criar e atualizar leads.

## BELLEART Marketing AI - Fase 3

A Fase 3 adiciona captação automática de leads ao CRM comercial, mantendo o SQLite aditivo com novas tabelas criadas por `CREATE TABLE IF NOT EXISTS` e novas colunas adicionadas apenas quando faltarem.

Recursos principais no menu **Marketing & Vendas > Captação de Leads**:

- **Fontes de lead:** Instagram, TikTok, Facebook, WhatsApp, Indicação, Panfleto, Google e Tráfego pago.
- **Links/códigos de campanha:** código interno, origem, tratamento, responsável, status, custo, observações e campo de integração futura.
- **Formulário rápido:** nome, telefone, interesse, origem, campanha e observação. Ao salvar, o lead entra automaticamente no Kanban do CRM em **Novo lead**.
- **Painel de captação:** leads por origem, leads por campanha, custo por lead, avaliações marcadas e fechamentos.
- **Preparação futura:** campos e seeds para Meta Ads, TikTok Ads, WhatsApp Business API e QR Code de panfleto.

Rotas específicas da API autenticada para a Fase 3:

```text
GET  /api/marketing-ai/sources
POST /api/marketing-ai/sources
GET  /api/marketing-ai/campaigns
POST /api/marketing-ai/campaigns
GET  /api/marketing-ai/capture/dashboard
POST /api/marketing-ai/capture/leads
```

As rotas genéricas `PUT /api/marketing-ai/:resource/:id` também permitem atualizar fontes e campanhas.


## BELLEART Marketing AI - Fase 5

A Fase 5 adiciona o **Calendário Inteligente de Conteúdo** para Instagram, TikTok, Facebook e WhatsApp. O banco continua incremental: as tabelas `content_calendar`, `content_ideas`, `content_categories`, `content_posts` e `content_metrics` são criadas com `CREATE TABLE IF NOT EXISTS`, sem apagar SQLite, pacientes ou registros existentes.

Recursos principais no menu **Marketing & Vendas > Calendário de Conteúdo**:

- **Calendário de Conteúdo:** planejamento por dia, semana e mês, com filtros por categoria, formato e status.
- **Ideias:** base inicial com 365 ideias de Reels, 365 ideias de Stories e 365 ideias de Carrosséis.
- **Biblioteca:** posts planejados com gancho, roteiro, legenda, CTA, hashtags, duração, categoria, plataforma e status.
- **Stories:** visão dedicada às ideias de Stories.
- **Métricas:** resumo de posts planejados, publicados, Reels, Stories, Carrosséis e conteúdos por categoria.
- **Categorias editoriais:** Implantes, Prótese Protocolo, Ortodontia, Botox, Preenchimento, Harmonização Facial, Clareamento, Próteses, Limpeza, Bastidores, Autoridade e Depoimentos.
- **Temas prontos:** Bastidores, antes e depois seguindo normas éticas, perguntas frequentes, promoções, autoridade e depoimentos.
- **Integrações futuras:** estrutura preparada para Instagram Graph API, TikTok Business API, Facebook Graph API e Metricool API.

Rotas específicas da API autenticada para a Fase 5:

```text
GET  /api/content/calendar
GET  /api/content/ideas
GET  /api/content/posts
POST /api/content/posts
PUT  /api/content/posts/:id
GET  /api/content/stories
GET  /api/content/dashboard
```

Filtros aceitos nas rotas de listagem: `day`, `week`, `month`, `category`, `format` e `status`.

## Módulos e permissões

- **Visão Geral:** Dashboard, Painel Executivo e Notificações.
- **Clínica:** Pacientes, Agenda, Orçamentos, Documentos, CRM de Implantes, Indicações e Reativação.
- **Marketing & Vendas:** Marketing, Campanhas, CRM, WhatsApp, tarefas, conteúdo e assistente de IA.
- **Gestão:** Financeiro, Financeiro de Implantes, Relatórios e Automações.
- **Administração:** Configurações, Gestão & Backup, Usuários, Auditoria e Perfil.

Os perfis disponíveis são Administrador, Dentista, Recepção, Financeiro, Marketing e Somente leitura. O backend valida as permissões mesmo quando um item não aparece no menu.

## Build e testes

Build de produção do frontend:

```bash
npm run build --prefix frontend
```

Testes do backend:

```bash
npm test --prefix backend
```

Verificação de sintaxe do backend:

```bash
find backend/src -name '*.js' -print0 | xargs -0 -n1 node --check
```

## Solução de problemas

- **`node` ou `npm` não encontrado:** instale o Node.js e abra um novo terminal.
- **Porta 3001 ocupada:** encerre outra instância do backend antes de iniciar.
- **Porta 5173 ocupada:** o Vite poderá escolher outra porta; use o endereço exibido no terminal do frontend.
- **Erro de login após alterar `ADMIN_PASSWORD`:** a variável só define a senha durante a criação do primeiro administrador; ela não sobrescreve um usuário existente.
- **Falha ao conectar à API:** confirme que backend e frontend estão abertos e que `http://localhost:3001/api/health` responde.

## Sessão e autenticação

O frontend mantém a sessão em duas chaves do navegador:

- `belleart_token`: token usado no cabeçalho `Authorization` das chamadas para a API.
- `belleart_user`: dados do usuário autenticado em JSON.

Se uma dessas chaves não existir ou estiver inválida, o sistema limpa a sessão local e mostra a tela de login. Se qualquer rota autenticada da API responder `401`, o frontend apaga automaticamente `belleart_token` e `belleart_user` e retorna para o login, impedindo que o Dashboard permaneça visível sem autenticação.

## BELLEART Marketing AI - Fase 6

A Fase 6 cria o **Assistente IA BELLEART** com uma base própria para prompts, Reels, Stories, campanhas, WhatsApp, ganchos e respostas. As alterações são aditivas: o SQLite usa `CREATE TABLE IF NOT EXISTS`, mantém pacientes e registros existentes e adiciona seeds sem remover dados.

Recursos principais no menu **Marketing & Vendas > Assistente IA**:

- **Abas:** Reels, Stories, Campanhas, WhatsApp, Ganchos, Respostas e Banco de Prompts.
- **Categorias:** Implantes, Ortodontia, Botox, Preenchimento, Clareamento e Próteses.
- **Banco inicial:** centenas de exemplos prontos, com conteúdo ético, CTA e observações para uso pela equipe.
- **Busca e filtro:** pesquisa por texto e categoria em todos os bancos do assistente.
- **Cópia rápida:** botão para copiar prompt, conteúdo e CTA para uso operacional.

Rotas específicas da API autenticada para a Fase 6:

```text
GET  /api/ai/summary
GET  /api/ai/reels
POST /api/ai/reels
GET  /api/ai/stories
POST /api/ai/stories
GET  /api/ai/campaigns
POST /api/ai/campaigns
GET  /api/ai/whatsapp
POST /api/ai/whatsapp
GET  /api/ai/hooks
POST /api/ai/hooks
GET  /api/ai/responses
POST /api/ai/responses
GET  /api/ai/prompts
POST /api/ai/prompts
```

As rotas `PUT /api/ai/:resource/:id` também permitem atualizar registros já salvos no Assistente IA.

## BELLEART OS - Fase 7: Central Comercial Inteligente

A Fase 7 transforma o BELLEART OS em uma central comercial para vendas odontológicas, mantendo todas as alterações aditivas. A inicialização preserva SQLite, pacientes, agenda, Marketing AI e dados existentes; as novas estruturas usam `CREATE TABLE IF NOT EXISTS`.

Novas tabelas comerciais:

- `crm_pipeline`
- `crm_contacts`
- `crm_tasks`
- `crm_objections`
- `crm_followups`
- `crm_campaigns`
- `crm_sales`
- `crm_notifications`
- `crm_metrics`

Páginas adicionadas ao menu **Marketing & Vendas**:

- **Central Comercial:** visão geral de leads, notificações, tarefas automáticas e follow-ups.
- **Pipeline:** Kanban comercial por etapa.
- **Leads:** cadastro de contatos com criação automática de tarefa, follow-up e notificação.
- **Follow-up:** retornos pendentes por WhatsApp e outros canais.
- **Objeções:** biblioteca inicial de objeções e respostas sugeridas.
- **Campanhas:** cadastro e ranking por leads, vendas, conversão e ROI.
- **Relatórios:** métricas de conversão e distribuição por etapa.
- **Dashboard Comercial:** indicadores executivos de vendas.

APIs autenticadas da Central Comercial:

```text
GET  /api/crm/pipeline
POST /api/crm/pipeline
PUT  /api/crm/pipeline/:id
GET  /api/crm/leads
POST /api/crm/leads
PUT  /api/crm/leads/:id
POST /api/crm/leads/:id/whatsapp-contact
GET  /api/crm/followups
POST /api/crm/followups
PUT  /api/crm/followups/:id
GET  /api/crm/tasks
POST /api/crm/tasks
PUT  /api/crm/tasks/:id
GET  /api/crm/campaigns
POST /api/crm/campaigns
PUT  /api/crm/campaigns/:id
GET  /api/crm/metrics
GET  /api/crm/dashboard
```

Para executar a Fase 7 em desenvolvimento:

```bash
npm install --prefix backend
npm install --prefix frontend
npm start --prefix backend
npm run dev --prefix frontend
```

## BELLEART Marketing AI - Fase 8

A Fase 8 adiciona a **Central de Tráfego e Integrações Sociais** sem apagar o SQLite e sem remover pacientes ou dados existentes. Todas as tabelas são criadas com `CREATE TABLE IF NOT EXISTS`.

Módulos no frontend:

- Central de Tráfego;
- Campanhas;
- Plataformas;
- Leads por origem;
- Métricas;
- Dashboard ROI;
- Integrações;
- Configurações de API.

Rotas autenticadas principais:

```text
GET/POST /api/ads/campaigns
GET/POST /api/ads/platforms
GET/POST /api/ads/leads
GET/POST /api/ads/metrics
GET      /api/ads/dashboard
GET/POST /api/social/integrations
GET/POST /api/social/accounts
GET/POST /api/social/tokens
GET/POST /api/social/posts
GET/POST /api/social/metrics
GET/POST /api/social/webhooks
GET/POST /api/api-credentials
```

Segurança das integrações:

- O sistema **não solicita senhas** de Facebook, Instagram, TikTok, Google ou WhatsApp.
- O sistema **não armazena senhas** de redes sociais.
- A preparação usa OAuth, `app_id`, `app_secret`, `client_id`, `client_secret`, `access_token`, `refresh_token`, escopos e permissões oficiais.
- Conectores preparados: Meta Graph API, Instagram Graph API, Facebook Pages API, Meta Marketing API, TikTok Content Posting API, TikTok Business API, Google Ads API e WhatsApp Business API.

## BELLEART OS Premium - Fases 10 a 20

A evolução Premium adiciona uma central única para marketing, vendas, atendimento, agenda, financeiro, documentos e inteligência artificial. A implementação preserva o SQLite e segue migrações aditivas com `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE` apenas quando necessário e seeds com `INSERT OR IGNORE`.

Novo módulo no menu **Visão Geral > BELLEART OS Premium**:

- **Secretária Virtual IA:** prioriza leads, calcula score comercial, identifica leads quentes, sugere respostas de WhatsApp, recomenda ligações e lista pacientes esquecidos para reativação.
- **Agendamento automático:** prepara confirmações, lembretes, faltosos, reagendamento, fila de encaixe e previsão de comparecimento.
- **Painel executivo:** consolida ROI, CPL, campanhas, conversão, ticket médio, fechamentos, faturamento, produção e inadimplência.
- **Financeiro avançado:** apresenta fluxo de caixa, DRE simplificada, previsão de faturamento, metas, parcelamentos, inadimplência e indicadores.
- **BELLEART AI 24h:** mantém banco de prompts, geradores de Reels, Stories, campanhas, anúncios e respostas de WhatsApp no Assistente IA existente.
- **Integrações oficiais:** estrutura preparada para Meta Graph API, Instagram Graph API, Meta Marketing API, TikTok Business API, TikTok Content Posting API, Google Ads API, WhatsApp Business API e Google Calendar API.
- **Automação e inteligência comercial:** cria regras para calendário automático, publicação programada, análise de desempenho, ranking futuro de campanhas/conteúdos, leads quentes, campanhas lucrativas, pacientes esquecidos e responsáveis com maior conversão.
- **Análise preditiva:** calcula previsões simples de faturamento, conversão, comparecimento e inadimplência a partir dos dados locais já existentes.
- **Central de documentos:** cria base local para contratos, termos, assinatura digital futura e armazenamento local.

Rotas autenticadas adicionadas:

```text
GET  /api/premium-os/virtual-secretary
GET  /api/premium-os/automatic-scheduling
GET  /api/premium-os/executive-panel
GET  /api/premium-os/advanced-financial
GET  /api/premium-os/integrations
POST /api/premium-os/waitlist
```

As integrações externas ficam preparadas para OAuth e APIs oficiais. O sistema não solicita nem armazena senhas de Instagram, Facebook, TikTok ou WhatsApp.

## Layout e Painel Executivo

O frontend usa `frontend/src/components/Layout.jsx`, `frontend/src/components/Navigation.jsx` e `frontend/src/styles.css` para manter a sidebar organizada à esquerda e o conteúdo principal à direita. O módulo **Painel Executivo** possui página própria em `frontend/src/pages/ExecutivePanel.jsx`, evitando a tela genérica de módulos para essa visão estratégica.

## QA profissional e fluxo operacional

### Como abrir o sistema

- **Windows:** execute `ABRIR_BELLEART_OS.bat`. O script valida Node.js, instala dependências ausentes, encerra processos antigos nas portas 3001 e 5173, inicia backend/frontend e abre uma única janela do navegador.
- **Manual:** use `npm start --prefix backend` e, em outro terminal, `npm run dev --prefix frontend`.

### Login inicial

- Usuário: `admin@belleart.local`
- Senha: `admin123`

Altere a senha inicial em ambiente real. O SQLite existente é preservado e o usuário inicial só é criado se ainda não houver administrador.

### Módulos principais revisados

O BELLEART OS organiza a operação em **Dashboard**, **Painel Executivo**, **Pacientes**, **Agenda**, **Orçamentos**, **Documentos**, **CRM de Implantes**, **Indicações**, **Reativação**, **Marketing**, **Captação de Leads**, **Campanhas**, **CRM**, **WhatsApp Inteligente**, **Tarefas Comerciais**, **Banco de Legendas**, **Calendário de Conteúdo**, **Assistente IA**, **Roteiros Reels**, **Banco de Stories**, **Métricas Sociais**, **Financeiro**, **Financeiro de Implantes**, **Relatórios**, **Automações**, **Configurações**, **Gestão & Backup**, **Usuários**, **Auditoria**, **Perfil**, **Central de Tráfego**, **Integrações Sociais** e **BELLEART OS Premium**.

### Perfis de acesso

- **Administrador:** acesso total.
- **Dentista:** clínica, pacientes, agenda, documentos, orçamentos e leitura financeira essencial.
- **Recepção:** pacientes, agenda, leads, notificações, CRM comercial e WhatsApp.
- **Financeiro:** financeiro, relatórios, indicadores executivos e financeiro de implantes.
- **Marketing:** marketing, vendas, CRM, WhatsApp, conteúdo, tráfego e dashboards comerciais.
- **Somente leitura:** consulta os módulos sem criar, alterar ou apagar dados.

### Como resolver porta ocupada

O inicializador Windows já tenta liberar as portas. Manualmente, use:

```bat
netstat -ano | findstr :3001
netstat -ano | findstr :5173
taskkill /PID NUMERO_DO_PID /F
```

No Linux/macOS:

```bash
lsof -i :3001
lsof -i :5173
kill -9 NUMERO_DO_PID
```

### Como rodar build, testes e validações

```bash
npm run build --prefix frontend
npm test --prefix backend
find backend/src -name '*.js' -print0 | xargs -0 -n1 node --check
node -e "require('./backend/src/database/schema')().then(()=>console.log('schema ok')).catch(e=>{console.error(e); process.exit(1)})"
```

### Fluxo padrão com Codex

1. Faça alterações aditivas e seguras, preservando SQLite e dados existentes.
2. Rode build do frontend, testes do backend, `node --check` e inicialização do schema.
3. Valide rotas principais com autenticação sempre que possível.
4. Crie commit claro na branch atual.
5. Abra Pull Request com resumo e testes executados.

## BELLEART OS - Fase Enterprise

A Fase Enterprise adiciona uma camada executiva sobre os módulos existentes sem remover dados e sem trocar o SQLite. As novas estruturas são criadas de forma incremental com `CREATE TABLE IF NOT EXISTS` e dados-base com `INSERT OR IGNORE`.

Recursos principais:

- **Central de Pacientes:** tabelas preparadas para ficha completa, odontograma, fotos, documentos, anexos, histórico clínico, tratamentos e evolução.
- **Central de Agendas:** mantém a agenda atual e integra indicadores de consultas, faltosos, encaixes e confirmações automáticas.
- **CRM Visual:** nova tela **Fase Enterprise** com Kanban profissional e drag and drop nas etapas Novo Lead, Contatado, Avaliação, Negociação, Fechado e Perdido.
- **Financeiro Enterprise:** resumo de DRE mensal, fluxo de receitas/despesas, saldo e bases para metas, parcelamentos e inadimplência.
- **Central de Marketing:** indicadores de campanhas, investimento, ROI/CPL e operação integrada a Instagram, TikTok, Facebook e WhatsApp.
- **BELLEART AI e Automações:** consolida conteúdos, campanhas, objeções, follow-ups, lembretes, notificações e reativações.
- **Dashboards:** bases registradas para Clínica, Marketing, CRM, Financeiro, WhatsApp e Premium.
- **Backup e versão comercial:** registro de backup/restauração/exportação e arquitetura inicial para multiusuário, multiclínicas, assinatura mensal e licença SaaS.

Rotas específicas da API autenticada:

```text
GET  /api/enterprise/summary
PUT  /api/enterprise/crm/leads/:id/stage
POST /api/enterprise/backups
```

## BELLEART OS Enterprise SaaS

Este bloco adiciona uma base Enterprise SaaS **local-first**. O sistema continua usando SQLite e todas as tabelas novas são criadas de forma aditiva com `CREATE TABLE IF NOT EXISTS`, sem apagar pacientes, agenda, financeiro, marketing, CRM, WhatsApp, documentos, configurações, usuários, auditoria ou dados existentes.

Nova página no menu **Visão Geral > Enterprise SaaS**:

- Central Clínica: ficha clínica, odontograma, evolução, anamnese, planos, fotos, anexos, receitas, atestados e termos.
- Central de Agenda: dia, semana, mês, encaixes, fila de espera, confirmações, faltosos, lembretes, salas e Google Calendar futuro por OAuth.
- Central Comercial: CRM Kanban com etapas profissionais, temperatura, prioridade, origem, campanha, responsável, tarefas e histórico.
- Central Financeira: DRE, fluxo de caixa, contas a pagar/receber, parcelamentos, inadimplência, metas, comissões e produção.
- Central de Marketing: posts, criativos, assets, hashtags, rankings, ROI e CPL.
- Central WhatsApp: conversas, contatos, etiquetas, responsáveis e preparação para WhatsApp Business API oficial.
- BELLEART AI: agentes, tarefas, recomendações, conteúdos, relatórios e biblioteca de prompts.
- Documentos, Automações, Relatórios, Backup, Segurança e preparação SaaS/multi-clínicas.
- PWA preparado com `manifest.webmanifest` para instalação futura em celular, sem app nativo.

### Segurança de integrações

O BELLEART OS não deve armazenar senhas de Instagram, Facebook, TikTok, WhatsApp ou Google. Integrações externas devem ser ativadas futuramente somente por OAuth ou APIs oficiais, com tokens seguros no backend, refresh token e permissões claras. O frontend nunca deve receber segredos.

### Rotas Enterprise

Todas as rotas abaixo exigem autenticação e perfil autorizado. Exemplos:

```text
GET/POST /api/clinical/records
GET/POST /api/clinical/odontogram
GET      /api/agenda/day
GET      /api/agenda/week
GET      /api/agenda/month
GET/POST /api/enterprise-crm/leads
GET      /api/enterprise-crm/dashboard
GET/POST /api/finance/dre
GET      /api/finance/dashboard
GET/POST /api/whatsapp-business/settings
GET/POST /api/ai/prompts
GET/POST /api/documents/templates
GET/POST /api/automations/rules
GET/POST /api/reports/templates
GET/POST /api/backup/jobs
GET/POST /api/saas/plans
```

## Módulos Enterprise adicionados

Esta versão evolui o BELLEART OS com módulos enterprise aditivos, preservando o SQLite e todos os cadastros já existentes. A inicialização usa `CREATE TABLE IF NOT EXISTS`, `INSERT OR IGNORE` e rotas autenticadas com auditoria nas alterações de dados.

### Central Clínica Enterprise

Menu **Clínica > Central Clínica** com abas para resumo, ficha clínica, odontograma, evolução, anamnese, plano de tratamento, fotos, anexos, receitas, atestados, termos e histórico de procedimentos.

Rotas autenticadas principais:

```text
/api/clinical/records
/api/clinical/odontogram
/api/clinical/evolutions
/api/clinical/anamnesis
/api/clinical/treatment-plans
/api/clinical/photos
/api/clinical/attachments
/api/clinical/prescriptions
/api/clinical/certificates
/api/clinical/consent-terms
/api/clinical/history
/api/clinical/dashboard
```

### CRM Kanban Enterprise

Menu **Marketing & Vendas > CRM Kanban Enterprise** com pipeline profissional: Novo Lead, Primeiro contato, Avaliação agendada, Avaliação realizada, Orçamento entregue, Negociação, Fechado e Perdido.

Rotas principais:

```text
/api/enterprise-crm/leads
/api/enterprise-crm/stages
/api/enterprise-crm/history
/api/enterprise-crm/tasks
/api/enterprise-crm/scores
/api/enterprise-crm/sources
/api/enterprise-crm/campaigns
/api/enterprise-crm/dashboard
```

### Secretária Virtual IA

Menu **Marketing & Vendas > Secretária Virtual IA** para prioridades do dia, alertas, sugestões, ligações, tarefas e follow-ups. As sugestões são preparadas localmente e não conectam serviços externos sem autorização.

### BELLEART AI

Menu **Marketing & Vendas > BELLEART AI** com agentes Marketing, Comercial, Financeiro e Executivo. A estrutura prepara geração de conteúdo, relatórios, recomendações e biblioteca de prompts. Integrações externas devem usar somente OAuth/API oficial, sem tokens reais no frontend e sem armazenar senhas de redes sociais.

### Automações Inteligentes

Menu **Gestão > Automações Inteligentes** com regras, gatilhos, condições, ações, fila e logs. Exemplos preparados: lead novo cria tarefa, orçamento entregue agenda follow-up, falta gera reagendamento e parcela atrasada gera notificação.

### Backup e Segurança

Menu **Administração > Backup e Segurança** com jobs de backup, arquivos, logs, saúde do sistema, eventos de segurança e eventos de auditoria. A restauração real fica preparada para implementação futura segura, sem apagar dados existentes.

### PWA / Mobile Ready

O frontend possui `manifest.webmanifest`, ícone SVG e service worker básico para shell da aplicação. O layout recebeu ajustes responsivos para celular/tablet e continua sendo uma aplicação web, sem app nativo.

## Verificações recomendadas

```bash
npm run build --prefix frontend
npm test --prefix backend
find backend/src -name '*.js' -print0 | xargs -0 -n1 node --check
node -e "require('./backend/src/database/schema')().then(()=>console.log('schema ok')).catch(e=>{console.error(e); process.exit(1)})"
```

## Validação automática completa

Para validar o BELLEART OS sem depender de testes manuais, execute os comandos abaixo na raiz do projeto:

```bash
npm run build --prefix frontend
npm test --prefix backend
find backend/src -name '*.js' -print0 | xargs -0 -n1 node --check
node -e "require('./backend/src/database/schema')().then(()=>console.log('schema ok')).catch(e=>{console.error(e); process.exit(1)})"
node backend/scripts/validate-system.js
node frontend/scripts/validate-routes.js
```

### O que a validação confere

- O SQLite é inicializado de forma incremental, sem apagar dados existentes.
- O login local do administrador é feito automaticamente com `admin@belleart.local` e `ADMIN_PASSWORD` ou `admin123`.
- As principais rotas da API são chamadas com `Authorization: Bearer`.
- A validação falha se alguma rota retornar erro 500, HTML indevido ou status inesperado.
- O frontend é conferido estaticamente para detectar rotas duplicadas, imports ausentes, módulos declarados e uso controlado do fallback operacional.

### Como interpretar o QA_REPORT.md

O arquivo `QA_REPORT.md` registra a data da validação, módulos conferidos, rotas testadas, correções aplicadas, módulos ainda atendidos pelo fallback operacional, resultado dos testes e próximos passos recomendados.

### Fluxo padrão com Codex

1. Solicite a alteração desejada de forma objetiva.
2. O Codex deve aplicar mudanças seguras e aditivas, preservando `backend/data/clinic.db` e dados existentes.
3. Antes de finalizar, rode build, testes, checagem de sintaxe, schema e scripts de validação.
4. Atualize `QA_REPORT.md` quando a mudança impactar rotas, módulos, APIs ou documentação operacional.
5. Faça commit e abra PR com resumo claro do que foi alterado.

### Comandos úteis

```bash
npm install --prefix backend
npm install --prefix frontend
npm start --prefix backend
npm run dev --prefix frontend
node backend/scripts/validate-system.js
node frontend/scripts/validate-routes.js
```

```

QA automático completo:

```bash
node backend/scripts/validate-system.js
node frontend/scripts/validate-routes.js
```

## Máquina diária de marketing e captação BELLEART

Esta fase cria uma operação diária para buscar no mínimo **15 pessoas por mês solicitando orçamento**, com captação, organização, priorização e acompanhamento dos interessados antes do fechamento pelo Dr. Rogério e equipe.

### Módulos criados no menu Marketing & Vendas

- **Meta de Orçamentos:** acompanha meta mensal de 15 orçamentos, orçamentos gerados, faltantes, média diária necessária, leads recebidos, qualificados, avaliações e alertas de ritmo.
- **Panfletagem:** cadastra campanhas rastreáveis com bairro, região, quantidade, responsável, custo, tratamento, oferta, código impresso, mensagem de WhatsApp, QR Code/link futuro, leads e custos por resultado.
- **Entrada Rápida de Lead:** registra nome, WhatsApp, interesse, origem, campanha, bairro, urgência e melhor horário; ao salvar, cria CRM/follow-up do dia e mensagem sugerida.
- **Rotina Comercial do Dia:** separa WhatsApp/telefone de hoje, atrasados, leads quentes, leads de panfleto e leads de Instagram/TikTok.
- **Painel de Marketing Diário:** mostra posts previstos/publicados, checklist, leads recebidos/contatados, follow-ups, orçamentos e avaliações.
- **Relatório Semanal:** consolida leads, orçamentos, origens, campanhas fortes/fracas, pendências da equipe e próximos passos.
- **Desempenho por Origem:** acompanha leads e orçamentos por Instagram, TikTok, Facebook, WhatsApp, Panfleto, Indicação, Google, Site e Tráfego pago.

### Fluxo recomendado de uso diário

1. Conferir **Meta de Orçamentos** para saber se a clínica está abaixo, dentro ou acima do ritmo dos 15 orçamentos/mês.
2. Abrir **Painel de Marketing Diário** e cumprir o checklist: 1 Reel, 3 Stories, responder comentários/directs, registrar leads e revisar follow-ups.
3. Registrar todo interessado na **Entrada Rápida de Lead**, inclusive contatos vindos de panfleto, Instagram, TikTok e WhatsApp.
4. Executar a **Rotina Comercial do Dia**, usando o botão de WhatsApp e registrando ações de follow-up.
5. Atualizar **Panfletagem** com distribuição, custo e retorno por bairro/campanha.
6. Toda semana, revisar o **Relatório Semanal** e reforçar as origens/campanhas que geram mais orçamentos.

### Rotas da API autenticada

```text
GET/POST /api/marketing-goals
GET/POST /api/flyers/campaigns
GET/POST /api/flyers/distribution
GET/POST /api/lead-capture
GET      /api/commercial-routine/today
POST     /api/commercial-routine/actions
GET      /api/marketing-daily/dashboard
GET      /api/marketing-weekly/reports
GET      /api/marketing-origin/performance
GET      /api/marketing-alerts
```

### Segurança e preservação de dados

- O SQLite continua sendo preservado e atualizado de forma incremental.
- Pacientes, agenda, financeiro, CRM, marketing, WhatsApp e dados existentes não são apagados.
- As novas tabelas são criadas com `CREATE TABLE IF NOT EXISTS`.
- Seeds e dados padrão usam `INSERT OR IGNORE`.
- Nenhuma senha de redes sociais é armazenada; integrações externas permanecem preparadas para OAuth/API oficial.

### Sprint marketing captação SDR

A sprint `sprint-marketing-captacao-sdr` reforça a máquina diária de marketing para a meta de **15 orçamentos/mês** com uma central operacional da SDR/Secretária Comercial. A tela de Rotina Comercial do Dia agora usa a central SDR para listar contatos do dia, mostrar follow-ups atrasados, abrir WhatsApp com mensagem sugerida e registrar os avanços do lead: contatado, avaliação agendada, orçamento enviado, fechado ou perdido.

Rotas adicionadas/revisadas:

```txt
GET  /api/sdr/dashboard
POST /api/sdr/leads/:id/status
GET  /api/marketing-weekly/reports
POST /api/marketing-weekly/reports/generate
GET  /api/marketing-origin/performance
```

As alterações permanecem aditivas e seguras para operação local-first: não apagam SQLite, não apagam pacientes, não removem dados existentes, mantêm `CREATE TABLE IF NOT EXISTS` nas estruturas da máquina diária e usam seeds com `INSERT OR IGNORE`.

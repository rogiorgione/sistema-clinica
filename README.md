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

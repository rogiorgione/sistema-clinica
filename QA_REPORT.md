# QA Report — BELLEART OS

**Data da validação:** 2026-06-25

## Sprint validada

**sprint-funcionario-virtual-marketing** — reposicionamento do BELLEART OS para deixar de parecer um ERP e passar a operar como um **funcionário virtual de marketing** focado em gerar pacientes novos.

## Resumo executivo

A sprint criou o dashboard principal **O QUE FAZER HOJE**, que passa a ser a primeira tela após login. A tela mostra somente ações práticas: conteúdo a postar, leads a responder, ligações, follow-ups atrasados, oferta do dia e panfletagem rastreável.

A implementação foi aditiva: o SQLite não foi apagado, pacientes não foram removidos e as estruturas existentes continuam disponíveis.

## Funcionalidades adicionadas e validadas

- Nova rota autenticada `GET /api/marketing-employee/dashboard` para montar a rotina diária da IA de marketing.
- Nova página React `MarketingEmployeeDashboard.jsx` com foco em **O QUE FAZER HOJE**.
- O login agora abre diretamente o funcionário virtual de marketing.
- Menu ganhou entrada principal **O que fazer hoje**.
- Dashboard inteligente com meta do mês, orçamentos, leads, conversão, melhor campanha, melhor origem, melhor horário e próximas tarefas.
- Bloco SDR mostra quem ligar primeiro, quem chamar no WhatsApp, quem esqueceu de responder, leads quentes e prováveis fechamentos.
- Bloco IA de marketing responde o que funcionou, o que não funcionou, o que repetir e o que parar.
- Bloco de conteúdo mostra posts prontos para aprovar com gancho, CTA e roteiro já vindos do calendário de 365 dias.
- Bloco de publicação reforça integrações oficiais via OAuth/API e que senhas não devem ser armazenadas.
- Permissões ajustadas para perfis clínicos/financeiros conseguirem visualizar a rotina de marketing em modo seguro de leitura.
- Validação automática do backend passou a incluir `/api/marketing-employee/dashboard`.

## Testes executados nesta rodada

- `npm run build --prefix frontend`: aprovado.
- `npm test --prefix backend`: aprovado.
- `node backend/scripts/validate-system.js`: aprovado.
- `node frontend/scripts/validate-routes.js`: aprovado.
- `node --check backend/src/routes/dailyMarketing.js`: aprovado.

## Rotas principais validadas automaticamente

O script `backend/scripts/validate-system.js` inicializa o banco sem apagar dados, autentica o administrador local, testa respostas com Bearer token, valida status HTTP 2xx, bloqueia HTML indevido e falha em qualquer erro 500.

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/patients`
- `GET /api/appointments`
- `GET /api/budgets`
- `GET /api/financial`
- `GET /api/marketing-employee/dashboard`
- `GET /api/marketing-ai/summary`
- `GET /api/content/dashboard`
- `GET /api/whatsapp/dashboard`
- `GET /api/ads/dashboard`
- `GET /api/premium-os/dashboard`
- `GET /api/enterprise/dashboard`
- `GET /api/enterprise-crm/dashboard`
- `GET /api/clinical/dashboard`
- `GET /api/secretary/dashboard`
- `GET /api/ai/agents`
- `GET /api/automations/dashboard`
- `GET /api/backup/jobs`

## Garantias da sprint

- SQLite preservado.
- Pacientes preservados.
- Dados existentes preservados.
- Build aprovado.
- Testes aprovados.
- QA automático aprovado.
- Meta de 15 orçamentos mantida como alvo mensal.
- Dashboard único de rotina diária criado.
- Integrações continuam preparadas para OAuth/API oficial, sem senha permanente.

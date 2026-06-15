# BELLEART OS

Sistema integrado para clínicas odontológicas, com frontend React/Vite, API Node.js/Express, SQLite, autenticação, permissões por perfil e trilha de auditoria.

## Módulos

- **Visão Geral:** Dashboard, Painel Executivo e Notificações.
- **Clínica:** Pacientes, Agenda, Orçamentos, Documentos, CRM de Implantes, Indicações e Reativação.
- **Marketing & Vendas:** Marketing, Campanhas, CRM, WhatsApp Inteligente, Tarefas Comerciais, Banco de Legendas, Calendário de Conteúdo, Assistente IA e Roteiros Reels.
- **Gestão:** Financeiro, Financeiro de Implantes, Relatórios e Automações.
- **Administração:** Configurações, Gestão & Backup, Usuários, Auditoria e Perfil.

Os CRUDs históricos de pacientes, agenda, orçamentos e financeiro foram preservados. Os módulos reintegrados usam `module_records`, uma estrutura comum e extensível que evita migrações destrutivas.

## Perfis e permissões

- **Administrador:** acesso total.
- **Dentista:** pacientes, agenda, orçamentos, documentos, CRM de implantes e leitura financeira.
- **Recepção:** pacientes, agenda, WhatsApp, tarefas e notificações.
- **Financeiro:** financeiro, financeiro de implantes, relatórios, documentos e parcelas.
- **Marketing:** campanhas, CRM, WhatsApp, legendas, calendário, IA, roteiros, painel executivo e tarefas.
- **Somente leitura:** consulta a todos os módulos, sem escrita.

O backend valida permissões independentemente do menu exibido no frontend. Alterações autenticadas geram registros de auditoria.

## Estrutura

```text
backend/
├── data/                 # clinic.db local (não versionado)
├── src/
│   ├── database/         # conexão e criação incremental das tabelas
│   ├── routes/           # rotas históricas, autenticação e módulos
│   ├── app.js            # API, compatibilidade e autorização
│   ├── auth.js           # senha, token e RBAC
│   └── server.js
└── test/                 # testes nativos do Node.js
frontend/
├── src/
│   ├── api/              # cliente HTTP autenticado
│   ├── components/       # layout e menu agrupado
│   ├── pages/            # login, CRUDs e página modular
│   ├── App.jsx
│   ├── modules.js        # catálogo e acesso dos módulos
│   └── styles.css
└── index.html
```

## Instalação e execução

Requer Node.js 18 ou superior.

```bash
npm install --prefix backend
npm install --prefix frontend
npm start --prefix backend
```

Em outro terminal:

```bash
npm run dev --prefix frontend
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001/api`
- Saúde: `GET http://localhost:3001/api/health`

### Primeiro acesso

- E-mail: `admin@belleart.local`
- Senha inicial: valor de `ADMIN_PASSWORD` ou, apenas em desenvolvimento, `admin123`.

Em produção, configure obrigatoriamente:

```bash
export ADMIN_PASSWORD='uma-senha-forte'
export AUTH_SECRET='um-segredo-longo-e-aleatorio'
```

O usuário administrador só é criado se ainda não existir; reiniciar a aplicação não sobrescreve usuários nem dados.

## API e compatibilidade

O login é público em `POST /api/auth/login`. Os demais endpoints, exceto `/api/health`, exigem `Authorization: Bearer <token>`.

Endpoints históricos preservados:

- `/api/dashboard`
- `/api/patients`
- `/api/appointments`
- `/api/budgets`
- `/api/financial` e `/api/financial/summary`

Endpoints integrados incluem `/api/marketing`, `/api/campaigns`, `/api/implants/dashboard`, `/api/documents`, `/api/reports/summary`, `/api/users` e `/api/audit`.

## Verificações

```bash
npm run build --prefix frontend
npm test --prefix backend
find backend/src -name '*.js' -print0 | xargs -0 -n1 node --check
git diff --check
```

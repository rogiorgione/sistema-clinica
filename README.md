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

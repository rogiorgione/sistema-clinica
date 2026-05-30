# Sistema de Gestão Odontológica

Primeira versão funcional de um sistema simples para gestão de clínica odontológica, com frontend em React, backend em Node.js/Express e persistência local em SQLite.

## Módulos disponíveis

- **Dashboard**: mostra a quantidade de pacientes cadastrados, consultas agendadas para hoje e orçamentos em tratamento.
- **Pacientes**: cadastro, edição, listagem e exclusão de pacientes. O CPF é obrigatório e único. Também há campo de Telefone/WhatsApp.
- **Orçamentos**: cadastro de orçamentos vinculados a pacientes com os status: Pendente, Aprovado, Em Tratamento, Concluído e Cancelado.
- **Financeiro**: controle de receitas/despesas, status de pagamento e resumo com receitas, despesas, pendências e saldo.
- **Agenda**: cadastro e gerenciamento de consultas com paciente, data, horário, procedimento, status e observações.

## Tecnologias

### Backend

- Node.js
- Express
- SQLite
- sqlite3
- CORS

### Frontend

- React
- Vite
- CSS simples

## Estrutura do projeto

```text
sistema-clinica/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js
│   ├── data/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

## Como instalar e executar

> Execute os comandos abaixo a partir da raiz do repositório.

### 1. Instalar dependências do backend

```bash
cd backend
npm install
```

### 2. Iniciar o backend

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3001
```

Endpoint de saúde:

```text
GET http://localhost:3001/api/health
```

### 3. Instalar dependências do frontend

Em outro terminal:

```bash
cd frontend
npm install
```

### 4. Iniciar o frontend

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Banco de dados SQLite

O banco é criado automaticamente ao iniciar o backend em:

```text
backend/data/clinic.db
```

Esse arquivo não é versionado pelo Git, porque representa dados locais da instalação.

## Scripts úteis

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

## Observações da primeira versão

- O sistema não possui autenticação nesta versão inicial.
- As validações são simples e focadas nos campos obrigatórios.
- O frontend usa navegação por estado interno, sem `react-router-dom`, para manter a base simples.
- O CPF dos pacientes é salvo somente com números e deve ser único.

const express = require('express');
const cors = require('cors');

const patientsRouter = require('./routes/patients');
const budgetsRouter = require('./routes/budgets');
const financialRouter = require('./routes/financial');
const appointmentsRouter = require('./routes/appointments');
const dashboardRouter = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok', message: 'API do sistema odontológico em execução.' });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/financial', financialRouter);
app.use('/api/appointments', appointmentsRouter);

app.use((request, response) => {
  response.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: 'Erro interno no servidor.' });
});

module.exports = app;

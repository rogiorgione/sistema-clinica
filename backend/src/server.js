const app = require('./app');
const initializeDatabase = require('./database/schema');
const { runStartupHealthCheck } = require('./startupHealth');

const PORT = process.env.PORT || 3001;

initializeDatabase()
  .then(async () => {
    const startupHealth = await runStartupHealthCheck();
    if (startupHealth.problems.length) {
      console.warn('Verificação inicial concluída com alertas:', startupHealth.problems);
    } else {
      console.log('Verificação inicial concluída: BELLEART IA está estável.');
    }

    app.listen(PORT, () => {
      console.log(`API do sistema odontológico rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  });

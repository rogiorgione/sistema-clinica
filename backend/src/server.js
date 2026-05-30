const app = require('./app');
const initializeDatabase = require('./database/schema');

const PORT = process.env.PORT || 3001;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API do sistema odontológico rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  });

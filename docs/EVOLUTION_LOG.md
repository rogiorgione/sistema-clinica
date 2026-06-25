# Log de Evolução Contínua — BELLEART IA

Este arquivo registra melhorias feitas por necessidade operacional real, sem adicionar recursos apenas por volume.

## 2026-06-25 — Verificação automática de inicialização

- **Motivo:** o BELLEART IA entrou em fase de uso real e precisa avisar rapidamente se banco, APIs internas, Brain, agentes, memória ou aprendizado estiverem instáveis ao iniciar.
- **Impacto:** o backend executa uma checagem não destrutiva na inicialização, grava o resultado em `system_health` e expõe o último diagnóstico em `/api/health` para facilitar suporte diário.
- **Arquivos alterados:**
  - `backend/src/startupHealth.js`
  - `backend/src/server.js`
  - `backend/src/app.js`
  - `backend/test/startupHealth.test.js`
  - `README.md`
  - `docs/EVOLUTION_LOG.md`
- **Testes executados:**
  - `npm test --prefix backend`
  - `npm run build --prefix frontend`

const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');
function createModuleRouter(moduleKey) {
  const router = express.Router();
  router.get('/', async (req, res, next) => { try { res.json(await all('SELECT * FROM module_records WHERE module_key = ? ORDER BY updated_at DESC', [moduleKey])); } catch (e) { next(e); } });
  router.post('/', async (req, res, next) => { try { const result = await run('INSERT INTO module_records (module_key, title, status, content, created_by) VALUES (?, ?, ?, ?, ?)', [moduleKey, req.body.title || 'Novo registro', req.body.status || 'ativo', JSON.stringify(req.body.content || {}), req.user.id]); await audit(req, 'create', moduleKey, `Registro ${result.id}`); res.status(201).json(await get('SELECT * FROM module_records WHERE id = ?', [result.id])); } catch (e) { next(e); } });
  router.put('/:id', async (req, res, next) => { try { const result = await run('UPDATE module_records SET title = ?, status = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND module_key = ?', [req.body.title || 'Registro', req.body.status || 'ativo', JSON.stringify(req.body.content || {}), req.params.id, moduleKey]); if (!result.changes) return res.status(404).json({ error: 'Registro não encontrado.' }); await audit(req, 'update', moduleKey, `Registro ${req.params.id}`); res.json(await get('SELECT * FROM module_records WHERE id = ?', [req.params.id])); } catch (e) { next(e); } });
  router.delete('/:id', async (req, res, next) => { try { const result = await run('DELETE FROM module_records WHERE id = ? AND module_key = ?', [req.params.id, moduleKey]); if (!result.changes) return res.status(404).json({ error: 'Registro não encontrado.' }); await audit(req, 'delete', moduleKey, `Registro ${req.params.id}`); res.status(204).send(); } catch (e) { next(e); } });
  return router;
}
module.exports = createModuleRouter;

const express = require('express');
const { all, get, run } = require('../database/connection');
const { audit } = require('../auth');
const router = express.Router();
const fields = ['provider','app_id','app_secret','client_id','client_secret','redirect_uri','scopes','status','notes'];
router.get('/', async (req, res, next) => { try { res.json(await all('SELECT * FROM api_credentials ORDER BY provider ASC')); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => { try { const data = Object.fromEntries(fields.map((f) => [f, req.body[f] ?? null])); const result = await run(`INSERT INTO api_credentials (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, Object.values(data)); await audit(req, 'create', 'api_credentials', `Registro ${result.id}`); res.status(201).json(await get('SELECT * FROM api_credentials WHERE id = ?', [result.id])); } catch (e) { next(e); } });
router.put('/:id', async (req, res, next) => { try { const data = Object.fromEntries(fields.map((f) => [f, req.body[f] ?? null])); const result = await run(`UPDATE api_credentials SET ${fields.map((f) => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...Object.values(data), req.params.id]); if (!result.changes) return res.status(404).json({ error: 'Credencial não encontrada.' }); await audit(req, 'update', 'api_credentials', `Registro ${req.params.id}`); res.json(await get('SELECT * FROM api_credentials WHERE id = ?', [req.params.id])); } catch (e) { next(e); } });
module.exports = router;

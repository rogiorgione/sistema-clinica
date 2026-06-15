const express = require('express');
const { all, get, run } = require('../database/connection');
const { hashPassword, audit } = require('../auth');
const router = express.Router();
router.get('/', async (req, res, next) => { try { res.json(await all('SELECT id, name, email, role, active, created_at FROM users ORDER BY name')); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => { try { if (!req.body.name || !req.body.email || !req.body.password || !req.body.role) return res.status(400).json({ error: 'Nome, e-mail, senha e perfil são obrigatórios.' }); const result = await run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [req.body.name, req.body.email, hashPassword(req.body.password), req.body.role]); await audit(req, 'create', 'users', `Usuário ${result.id}`); res.status(201).json(await get('SELECT id, name, email, role, active FROM users WHERE id = ?', [result.id])); } catch (e) { next(e); } });
module.exports = router;

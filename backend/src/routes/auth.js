const express = require('express');
const { get } = require('../database/connection');
const { verifyPassword, sign, ROLE_PERMISSIONS } = require('../auth');
const router = express.Router();
router.post('/login', async (request, response, next) => {
  try {
    const user = await get('SELECT * FROM users WHERE lower(email) = lower(?)', [request.body.email || '']);
    if (!user || !user.active || !verifyPassword(request.body.password || '', user.password_hash)) return response.status(401).json({ error: 'E-mail ou senha inválidos.' });
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    response.json({ token: sign({ id: user.id, exp: Date.now() + 12 * 60 * 60 * 1000 }), user: safeUser, permissions: ROLE_PERMISSIONS[user.role] || [] });
  } catch (error) { next(error); }
});
module.exports = router;

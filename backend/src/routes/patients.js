const express = require('express');
const { all, get, run } = require('../database/connection');

const router = express.Router();

function normalizeCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

router.get('/', async (request, response, next) => {
  try {
    const patients = await all('SELECT * FROM patients ORDER BY name COLLATE NOCASE');
    response.json(patients);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const patient = await get('SELECT * FROM patients WHERE id = ?', [request.params.id]);

    if (!patient) {
      response.status(404).json({ error: 'Paciente não encontrado.' });
      return;
    }

    response.json(patient);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const { name, phone_whatsapp, email, birth_date, notes } = request.body;
    const cpf = normalizeCpf(request.body.cpf);

    if (!name || !cpf) {
      response.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
      return;
    }

    const result = await run(
      `INSERT INTO patients (name, cpf, phone_whatsapp, email, birth_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), cpf, phone_whatsapp || '', email || '', birth_date || '', notes || ''],
    );

    const patient = await get('SELECT * FROM patients WHERE id = ?', [result.id]);
    response.status(201).json(patient);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed: patients.cpf')) {
      response.status(409).json({ error: 'Já existe um paciente cadastrado com este CPF.' });
      return;
    }

    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const { name, phone_whatsapp, email, birth_date, notes } = request.body;
    const cpf = normalizeCpf(request.body.cpf);

    if (!name || !cpf) {
      response.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
      return;
    }

    const result = await run(
      `UPDATE patients
       SET name = ?, cpf = ?, phone_whatsapp = ?, email = ?, birth_date = ?, notes = ?
       WHERE id = ?`,
      [name.trim(), cpf, phone_whatsapp || '', email || '', birth_date || '', notes || '', request.params.id],
    );

    if (!result.changes) {
      response.status(404).json({ error: 'Paciente não encontrado.' });
      return;
    }

    const patient = await get('SELECT * FROM patients WHERE id = ?', [request.params.id]);
    response.json(patient);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed: patients.cpf')) {
      response.status(409).json({ error: 'Já existe um paciente cadastrado com este CPF.' });
      return;
    }

    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const result = await run('DELETE FROM patients WHERE id = ?', [request.params.id]);

    if (!result.changes) {
      response.status(404).json({ error: 'Paciente não encontrado.' });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const { all, get, run } = require('../database/connection');

const router = express.Router();
const VALID_STATUSES = ['Pendente', 'Aprovado', 'Em Tratamento', 'Concluído', 'Cancelado'];

function validateBudget(body) {
  const patientId = Number(body.patient_id);
  const totalAmount = Number(body.total_amount);

  if (!patientId || !body.description || Number.isNaN(totalAmount)) {
    return 'Paciente, descrição e valor total são obrigatórios.';
  }

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return 'Status do orçamento inválido.';
  }

  return null;
}

const budgetSelect = `
  SELECT budgets.*, patients.name AS patient_name
  FROM budgets
  INNER JOIN patients ON patients.id = budgets.patient_id
`;

router.get('/', async (request, response, next) => {
  try {
    const budgets = await all(`${budgetSelect} ORDER BY budgets.created_at DESC`);
    response.json(budgets);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const budget = await get(`${budgetSelect} WHERE budgets.id = ?`, [request.params.id]);

    if (!budget) {
      response.status(404).json({ error: 'Orçamento não encontrado.' });
      return;
    }

    response.json(budget);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const validationError = validateBudget(request.body);

    if (validationError) {
      response.status(400).json({ error: validationError });
      return;
    }

    const result = await run(
      `INSERT INTO budgets (patient_id, description, total_amount, status)
       VALUES (?, ?, ?, ?)`,
      [request.body.patient_id, request.body.description, request.body.total_amount, request.body.status || 'Pendente'],
    );

    const budget = await get(`${budgetSelect} WHERE budgets.id = ?`, [result.id]);
    response.status(201).json(budget);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const validationError = validateBudget(request.body);

    if (validationError) {
      response.status(400).json({ error: validationError });
      return;
    }

    const result = await run(
      `UPDATE budgets
       SET patient_id = ?, description = ?, total_amount = ?, status = ?
       WHERE id = ?`,
      [request.body.patient_id, request.body.description, request.body.total_amount, request.body.status || 'Pendente', request.params.id],
    );

    if (!result.changes) {
      response.status(404).json({ error: 'Orçamento não encontrado.' });
      return;
    }

    const budget = await get(`${budgetSelect} WHERE budgets.id = ?`, [request.params.id]);
    response.json(budget);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const result = await run('DELETE FROM budgets WHERE id = ?', [request.params.id]);

    if (!result.changes) {
      response.status(404).json({ error: 'Orçamento não encontrado.' });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const { all, get, run } = require('../database/connection');

const router = express.Router();
const VALID_TYPES = ['receita', 'despesa'];
const VALID_STATUSES = ['pendente', 'pago', 'cancelado'];

const financialSelect = `
  SELECT financial_records.*, patients.name AS patient_name, budgets.description AS budget_description
  FROM financial_records
  LEFT JOIN patients ON patients.id = financial_records.patient_id
  LEFT JOIN budgets ON budgets.id = financial_records.budget_id
`;

function nullableId(value) {
  return value ? Number(value) : null;
}

function validateFinancial(body) {
  const amount = Number(body.amount);

  if (!body.description || !body.type || Number.isNaN(amount)) {
    return 'Descrição, tipo e valor são obrigatórios.';
  }

  if (!VALID_TYPES.includes(body.type)) {
    return 'Tipo financeiro inválido.';
  }

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return 'Status financeiro inválido.';
  }

  return null;
}

router.get('/summary', async (request, response, next) => {
  try {
    const rows = await all(`
      SELECT type, status, COALESCE(SUM(amount), 0) AS total
      FROM financial_records
      WHERE status != 'cancelado'
      GROUP BY type, status
    `);

    const summary = rows.reduce(
      (accumulator, row) => {
        const total = Number(row.total) || 0;

        if (row.type === 'receita' && row.status === 'pago') {
          accumulator.income += total;
        }

        if (row.type === 'despesa' && row.status === 'pago') {
          accumulator.expenses += total;
        }

        if (row.status === 'pendente') {
          accumulator.pending += total;
        }

        return accumulator;
      },
      { income: 0, expenses: 0, pending: 0, balance: 0 },
    );

    summary.balance = summary.income - summary.expenses;
    response.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (request, response, next) => {
  try {
    const records = await all(`${financialSelect} ORDER BY financial_records.created_at DESC`);
    response.json(records);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const record = await get(`${financialSelect} WHERE financial_records.id = ?`, [request.params.id]);

    if (!record) {
      response.status(404).json({ error: 'Lançamento financeiro não encontrado.' });
      return;
    }

    response.json(record);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const validationError = validateFinancial(request.body);

    if (validationError) {
      response.status(400).json({ error: validationError });
      return;
    }

    const result = await run(
      `INSERT INTO financial_records
       (patient_id, budget_id, type, description, amount, due_date, payment_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nullableId(request.body.patient_id),
        nullableId(request.body.budget_id),
        request.body.type,
        request.body.description,
        request.body.amount,
        request.body.due_date || '',
        request.body.payment_date || '',
        request.body.status || 'pendente',
      ],
    );

    const record = await get(`${financialSelect} WHERE financial_records.id = ?`, [result.id]);
    response.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const validationError = validateFinancial(request.body);

    if (validationError) {
      response.status(400).json({ error: validationError });
      return;
    }

    const result = await run(
      `UPDATE financial_records
       SET patient_id = ?, budget_id = ?, type = ?, description = ?, amount = ?, due_date = ?, payment_date = ?, status = ?
       WHERE id = ?`,
      [
        nullableId(request.body.patient_id),
        nullableId(request.body.budget_id),
        request.body.type,
        request.body.description,
        request.body.amount,
        request.body.due_date || '',
        request.body.payment_date || '',
        request.body.status || 'pendente',
        request.params.id,
      ],
    );

    if (!result.changes) {
      response.status(404).json({ error: 'Lançamento financeiro não encontrado.' });
      return;
    }

    const record = await get(`${financialSelect} WHERE financial_records.id = ?`, [request.params.id]);
    response.json(record);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const result = await run('DELETE FROM financial_records WHERE id = ?', [request.params.id]);

    if (!result.changes) {
      response.status(404).json({ error: 'Lançamento financeiro não encontrado.' });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

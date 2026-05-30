const express = require('express');
const { get } = require('../database/connection');

const router = express.Router();

router.get('/', async (request, response, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const patients = await get('SELECT COUNT(*) AS total FROM patients');
    const todayAppointments = await get(
      `SELECT COUNT(*) AS total
       FROM appointments
       WHERE appointment_date = ? AND status = 'agendado'`,
      [today],
    );
    const treatmentBudgets = await get(
      `SELECT COUNT(*) AS total
       FROM budgets
       WHERE status = 'Em Tratamento'`,
    );

    response.json({
      totalPatients: patients.total,
      todayAppointments: todayAppointments.total,
      treatmentBudgets: treatmentBudgets.total,
      date: today,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

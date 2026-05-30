const express = require('express');
const { all, get, run } = require('../database/connection');

const router = express.Router();
const VALID_STATUSES = ['agendado', 'concluido', 'cancelado'];

const appointmentSelect = `
  SELECT appointments.*, patients.name AS patient_name
  FROM appointments
  INNER JOIN patients ON patients.id = appointments.patient_id
`;

function validateAppointment(body) {
  if (!body.patient_id || !body.appointment_date || !body.appointment_time || !body.procedure) {
    return 'Paciente, data, horário e procedimento são obrigatórios.';
  }

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return 'Status do agendamento inválido.';
  }

  return null;
}

router.get('/', async (request, response, next) => {
  try {
    const appointments = await all(`${appointmentSelect} ORDER BY appointments.appointment_date, appointments.appointment_time`);
    response.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  try {
    const appointment = await get(`${appointmentSelect} WHERE appointments.id = ?`, [request.params.id]);

    if (!appointment) {
      response.status(404).json({ error: 'Agendamento não encontrado.' });
      return;
    }

    response.json(appointment);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const validationError = validateAppointment(request.body);

    if (validationError) {
      response.status(400).json({ error: validationError });
      return;
    }

    const result = await run(
      `INSERT INTO appointments (patient_id, appointment_date, appointment_time, procedure, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        request.body.patient_id,
        request.body.appointment_date,
        request.body.appointment_time,
        request.body.procedure,
        request.body.status || 'agendado',
        request.body.notes || '',
      ],
    );

    const appointment = await get(`${appointmentSelect} WHERE appointments.id = ?`, [result.id]);
    response.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const validationError = validateAppointment(request.body);

    if (validationError) {
      response.status(400).json({ error: validationError });
      return;
    }

    const result = await run(
      `UPDATE appointments
       SET patient_id = ?, appointment_date = ?, appointment_time = ?, procedure = ?, status = ?, notes = ?
       WHERE id = ?`,
      [
        request.body.patient_id,
        request.body.appointment_date,
        request.body.appointment_time,
        request.body.procedure,
        request.body.status || 'agendado',
        request.body.notes || '',
        request.params.id,
      ],
    );

    if (!result.changes) {
      response.status(404).json({ error: 'Agendamento não encontrado.' });
      return;
    }

    const appointment = await get(`${appointmentSelect} WHERE appointments.id = ?`, [request.params.id]);
    response.json(appointment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const result = await run('DELETE FROM appointments WHERE id = ?', [request.params.id]);

    if (!result.changes) {
      response.status(404).json({ error: 'Agendamento não encontrado.' });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

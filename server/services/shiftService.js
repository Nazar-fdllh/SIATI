const { db } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all shifts
 */
async function getShifts() {
  return db('shifts').orderBy('start_time', 'asc');
}

/**
 * Create a new shift
 */
async function createShift(data) {
  const [shift] = await db('shifts').insert({
    name: data.name,
    start_time: data.start_time,
    end_time: data.end_time,
    tolerance_minutes: data.tolerance_minutes || 15,
    break_duration_minutes: data.break_duration_minutes || 60,
    is_active: true
  }).returning('*');

  return shift;
}

/**
 * Update a shift
 */
async function updateShift(id, data) {
  const [shift] = await db('shifts')
    .where('id', id)
    .update({
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      tolerance_minutes: data.tolerance_minutes,
      break_duration_minutes: data.break_duration_minutes,
      is_active: data.is_active,
      updated_at: new Date()
    })
    .returning('*');

  if (!shift) throw new AppError('Shift tidak ditemukan', 404);
  return shift;
}

module.exports = {
  getShifts,
  createShift,
  updateShift,
};

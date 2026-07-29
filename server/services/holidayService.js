const { db } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all holidays for a specific year
 */
async function getHolidays(year) {
  const targetYear = year || new Date().getFullYear();
  return db('holidays').where('year', targetYear).orderBy('holiday_date', 'asc');
}

/**
 * Create a new holiday
 */
async function createHoliday(data) {
  const exists = await db('holidays').where({ holiday_date: data.holiday_date, name: data.name }).first();
  if (exists) throw new AppError('Hari libur dengan tanggal dan nama yang sama sudah ada', 400);

  const [holiday] = await db('holidays').insert({
    name: data.name,
    holiday_date: data.holiday_date,
    type: data.type || 'national',
    is_recurring: data.is_recurring || false,
    year: new Date(data.holiday_date).getFullYear(),
    description: data.description
  }).returning('*');

  return holiday;
}

/**
 * Delete a holiday
 */
async function deleteHoliday(id) {
  const deleted = await db('holidays').where('id', id).del();
  if (!deleted) throw new AppError('Hari libur tidak ditemukan', 404);
  return { success: true };
}

module.exports = {
  getHolidays,
  createHoliday,
  deleteHoliday,
};

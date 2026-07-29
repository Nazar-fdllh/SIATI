const holidayService = require('../services/holidayService');
const shiftService = require('../services/shiftService');
const auditLogService = require('../services/auditLogService');

// --- Holiday Controllers ---
async function getHolidays(req, res, next) {
  try {
    const year = req.query.year || new Date().getFullYear();
    const data = await holidayService.getHolidays(year);
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

async function createHoliday(req, res, next) {
  try {
    const data = await holidayService.createHoliday(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
}

async function deleteHoliday(req, res, next) {
  try {
    await holidayService.deleteHoliday(req.params.id);
    res.json({ success: true, message: 'Hari libur dihapus' });
  } catch (error) { next(error); }
}

// --- Shift Controllers ---
async function getShifts(req, res, next) {
  try {
    const data = await shiftService.getShifts();
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

async function createShift(req, res, next) {
  try {
    const data = await shiftService.createShift(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
}

async function updateShift(req, res, next) {
  try {
    const data = await shiftService.updateShift(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

// --- Audit Log Controllers ---
async function getAuditLogs(req, res, next) {
  try {
    const { page, limit, module, action, userId } = req.query;
    const result = await auditLogService.getLogs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      module,
      action,
      userId
    });
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
}

module.exports = {
  getHolidays, createHoliday, deleteHoliday,
  getShifts, createShift, updateShift,
  getAuditLogs
};

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middleware/auth');

// All settings require Super Admin or HRD
router.use(requireAuth);
router.use(requireRole(['super_admin', 'hrd']));

// Holidays
router.get('/holidays', settingsController.getHolidays);
router.post('/holidays', settingsController.createHoliday);
router.delete('/holidays/:id', settingsController.deleteHoliday);

// Shifts
router.get('/shifts', settingsController.getShifts);
router.post('/shifts', settingsController.createShift);
router.put('/shifts/:id', settingsController.updateShift);

// Audit Logs (Super Admin only for logs is better, but keeping HRD allowed for now as per simple RBAC)
router.get('/audit-logs', requireRole(['super_admin']), settingsController.getAuditLogs);

// System Config
router.get('/config', settingsController.getConfig);
router.put('/config', settingsController.updateConfig);

module.exports = router;

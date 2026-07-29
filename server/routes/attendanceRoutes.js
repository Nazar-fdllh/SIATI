const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { checkInSchema, checkOutSchema } = require('../validators/attendanceValidator');
const { PERMISSIONS } = require('@siati/shared');

const router = express.Router();

router.use(authenticate);

// Regular Employee routes
router.post('/check-in', checkPermission(PERMISSIONS.ATTENDANCE_CHECKIN), validate(checkInSchema), attendanceController.checkIn);
router.post('/check-out', checkPermission(PERMISSIONS.ATTENDANCE_CHECKOUT), validate(checkOutSchema), attendanceController.checkOut);
router.get('/today', checkPermission(PERMISSIONS.ATTENDANCE_READ_OWN), attendanceController.getToday);
router.get('/history', checkPermission(PERMISSIONS.ATTENDANCE_READ_OWN), attendanceController.getHistory);
router.get('/monthly-summary', checkPermission(PERMISSIONS.ATTENDANCE_READ_OWN), attendanceController.getMonthlySummary);

// Supervisor routes
router.get('/team', checkPermission(PERMISSIONS.ATTENDANCE_READ_TEAM), attendanceController.getTeam);

// HRD/Admin routes
router.get('/all', checkPermission(PERMISSIONS.ATTENDANCE_READ_ALL), attendanceController.getAll);
router.get('/monitor', checkPermission(PERMISSIONS.ATTENDANCE_READ_ALL), attendanceController.getMonitorData);

module.exports = router;

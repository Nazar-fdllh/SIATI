const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/auth');

// All reports require HRD or Super Admin role
router.use(requireAuth);
router.use(requireRole(['super_admin', 'hrd']));

// Attendance Reports
router.get('/attendance/excel', reportController.exportAttendanceExcel);
router.get('/attendance/pdf', reportController.exportAttendancePDF);

// Leave Reports
router.get('/leave/excel', reportController.exportLeaveExcel);

module.exports = router;

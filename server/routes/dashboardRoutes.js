const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Dashboard routes (accessible to all authenticated users, data filtered by role inside service)
router.get('/stats', dashboardController.getStats);
router.get('/attendance-chart', dashboardController.getAttendanceChart);
router.get('/recent-activities', dashboardController.getRecentActivities);

module.exports = router;

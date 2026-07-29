const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');

// Mount routes
router.use('/auth', authRoutes);

// Placeholder routes for future modules
router.get('/attendance', (req, res) => {
  res.json({ success: true, message: 'Attendance API - Coming Soon' });
});

router.get('/leaves', (req, res) => {
  res.json({ success: true, message: 'Leave API - Coming Soon' });
});

router.get('/employees', (req, res) => {
  res.json({ success: true, message: 'Employee API - Coming Soon' });
});

router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Dashboard API - Coming Soon' });
});

module.exports = router;

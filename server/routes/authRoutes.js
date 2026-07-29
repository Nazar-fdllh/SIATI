const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, changePasswordSchema } = require('../validators/authValidator');
const { auditLog } = require('../middleware/auditLogger');

const router = express.Router();

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
    code: 'RATE_LIMITED',
  },
});

// Public routes
router.post('/login', authLimiter, validate(loginSchema), auditLog('login', 'auth'), authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, auditLog('logout', 'auth'), authController.logout);
router.put('/change-password', authenticate, validate(changePasswordSchema), auditLog('change_password', 'auth'), authController.changePassword);
router.get('/me', authenticate, authController.getMe);

module.exports = router;

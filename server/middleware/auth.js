const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { db } = require('../config/database');

/**
 * Middleware: Verify JWT access token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
        code: 'AUTH_FAILED',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);

    // Get user with role
    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .select(
        'users.id',
        'users.email',
        'users.is_active',
        'users.role_id',
        'roles.name as role_name'
      )
      .where('users.id', decoded.userId)
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan.',
        code: 'AUTH_FAILED',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan.',
        code: 'FORBIDDEN',
      });
    }

    // Get user permissions
    const permissions = await db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', user.role_id)
      .pluck('permissions.code');

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      permissions,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token telah kedaluwarsa.',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid.',
        code: 'AUTH_FAILED',
      });
    }
    next(error);
  }
}

/**
 * Optional auth - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}

module.exports = { authenticate, optionalAuth };

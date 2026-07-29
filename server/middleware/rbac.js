const { ROLES } = require('@siati/shared');

/**
 * Middleware: Check if user has one of the required roles
 * Usage: requireRole(ROLES.SUPER_ADMIN, ROLES.HRD)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan.',
        code: 'AUTH_FAILED',
      });
    }

    if (!roles.includes(req.user.roleName)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

/**
 * Middleware: Check if user has one of the required permissions
 * Usage: requirePermission('attendance:checkin', 'attendance:checkout')
 */
function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan.',
        code: 'AUTH_FAILED',
      });
    }

    const hasPermission = permissions.some((perm) =>
      req.user.permissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

/**
 * Middleware: Check role is at least supervisor level
 */
function requireSupervisorOrAbove(req, res, next) {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.HRD, ROLES.SUPERVISOR];
  return requireRole(...allowedRoles)(req, res, next);
}

/**
 * Middleware: Check role is at least HRD level
 */
function requireHRDOrAbove(req, res, next) {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.HRD];
  return requireRole(...allowedRoles)(req, res, next);
}

/**
 * Middleware: Only super admin
 */
function requireAdmin(req, res, next) {
  return requireRole(ROLES.SUPER_ADMIN)(req, res, next);
}

module.exports = {
  requireRole,
  requirePermission,
  requireSupervisorOrAbove,
  requireHRDOrAbove,
  requireAdmin,
};

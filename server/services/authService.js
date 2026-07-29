const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const jwtConfig = require('../config/jwt');
const { AppError } = require('../middleware/errorHandler');

/**
 * Generate JWT access token
 */
function generateAccessToken(userId, roleName) {
  return jwt.sign(
    { userId, role: roleName },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );
}

/**
 * Generate JWT refresh token
 */
function generateRefreshToken(userId) {
  return jwt.sign(
    { userId, type: 'refresh' },
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn }
  );
}

/**
 * Login user
 */
async function login(email, password) {
  // Get user with role
  const user = await db('users')
    .join('roles', 'users.role_id', 'roles.id')
    .select(
      'users.id',
      'users.email',
      'users.password_hash',
      'users.is_active',
      'users.failed_login_attempts',
      'users.locked_until',
      'roles.name as role_name'
    )
    .where('users.email', email.toLowerCase().trim())
    .first();

  if (!user) {
    throw new AppError('Email atau password salah.', 401, 'AUTH_FAILED');
  }

  // Check if account is locked
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const minutesLeft = Math.ceil(
      (new Date(user.locked_until) - new Date()) / 60000
    );
    throw new AppError(
      `Akun terkunci. Coba lagi dalam ${minutesLeft} menit.`,
      423,
      'ACCOUNT_LOCKED'
    );
  }

  if (!user.is_active) {
    throw new AppError('Akun Anda telah dinonaktifkan.', 403, 'FORBIDDEN');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    // Increment failed attempts
    const attempts = (user.failed_login_attempts || 0) + 1;
    const updates = { failed_login_attempts: attempts };

    // Lock account after 5 failed attempts
    if (attempts >= 5) {
      updates.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    }

    await db('users').where('id', user.id).update(updates);

    throw new AppError('Email atau password salah.', 401, 'AUTH_FAILED');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role_name);
  const refreshToken = generateRefreshToken(user.id);

  // Save refresh token and reset failed attempts
  await db('users').where('id', user.id).update({
    refresh_token: refreshToken,
    refresh_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    last_login: new Date(),
    failed_login_attempts: 0,
    locked_until: null,
  });

  // Get employee info
  const employee = await db('employees')
    .select('id', 'full_name', 'employee_code', 'photo_url')
    .where('user_id', user.id)
    .first();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role_name,
      employee: employee || null,
    },
  };
}

/**
 * Refresh access token
 */
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Refresh token tidak ditemukan.', 401, 'AUTH_FAILED');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, jwtConfig.refreshToken.secret);
  } catch {
    throw new AppError('Refresh token tidak valid atau kedaluwarsa.', 401, 'TOKEN_EXPIRED');
  }

  // Check refresh token in database
  const user = await db('users')
    .join('roles', 'users.role_id', 'roles.id')
    .select('users.id', 'users.email', 'users.is_active', 'users.refresh_token', 'roles.name as role_name')
    .where('users.id', decoded.userId)
    .first();

  if (!user || user.refresh_token !== refreshToken || !user.is_active) {
    throw new AppError('Sesi tidak valid. Silakan login kembali.', 401, 'AUTH_FAILED');
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user.id, user.role_name);

  // Token rotation: generate new refresh token
  const newRefreshToken = generateRefreshToken(user.id);
  await db('users').where('id', user.id).update({
    refresh_token: newRefreshToken,
    refresh_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Logout user
 */
async function logout(userId) {
  await db('users').where('id', userId).update({
    refresh_token: null,
    refresh_token_expires_at: null,
  });
}

/**
 * Change password
 */
async function changePassword(userId, currentPassword, newPassword) {
  const user = await db('users')
    .select('id', 'password_hash')
    .where('id', userId)
    .first();

  if (!user) {
    throw new AppError('User tidak ditemukan.', 404, 'NOT_FOUND');
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new AppError('Password lama salah.', 400, 'VALIDATION_ERROR');
  }

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(newPassword, salt);

  await db('users').where('id', userId).update({
    password_hash: hash,
    password_changed_at: new Date(),
    refresh_token: null, // Invalidate all sessions
  });
}

/**
 * Get current user profile with employee details
 */
async function getCurrentUser(userId) {
  const user = await db('users')
    .join('roles', 'users.role_id', 'roles.id')
    .select(
      'users.id',
      'users.email',
      'users.last_login',
      'users.created_at',
      'roles.name as role_name'
    )
    .where('users.id', userId)
    .first();

  if (!user) {
    throw new AppError('User tidak ditemukan.', 404, 'NOT_FOUND');
  }

  const employee = await db('employees')
    .leftJoin('departments', 'employees.department_id', 'departments.id')
    .leftJoin('positions', 'employees.position_id', 'positions.id')
    .select(
      'employees.id',
      'employees.employee_code',
      'employees.full_name',
      'employees.nickname',
      'employees.phone',
      'employees.photo_url',
      'employees.join_date',
      'employees.employment_status',
      'departments.name as department_name',
      'positions.name as position_name'
    )
    .where('employees.user_id', userId)
    .first();

  // Get permissions
  const permissions = await db('role_permissions')
    .join('permissions', 'role_permissions.permission_id', 'permissions.id')
    .where('role_permissions.role_id', user.role_id || (await db('users').where('id', userId).select('role_id').first()).role_id)
    .pluck('permissions.code');

  return {
    ...user,
    employee: employee || null,
    permissions,
  };
}

module.exports = {
  login,
  refreshAccessToken,
  logout,
  changePassword,
  getCurrentUser,
};

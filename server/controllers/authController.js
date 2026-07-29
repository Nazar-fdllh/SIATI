const authService = require('../services/authService');
const jwtConfig = require('../config/jwt');
const response = require('../utils/response');

/**
 * POST /auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie(
      jwtConfig.cookie.name,
      result.refreshToken,
      jwtConfig.cookie.options
    );

    return response.success(res, {
      accessToken: result.accessToken,
      user: result.user,
    }, 'Login berhasil');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/refresh-token
 */
async function refreshToken(req, res, next) {
  try {
    const token = req.cookies[jwtConfig.cookie.name];
    const result = await authService.refreshAccessToken(token);

    // Update refresh token cookie
    res.cookie(
      jwtConfig.cookie.name,
      result.refreshToken,
      jwtConfig.cookie.options
    );

    return response.success(res, {
      accessToken: result.accessToken,
    }, 'Token berhasil diperbarui');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/logout
 */
async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id);

    // Clear refresh token cookie
    res.clearCookie(jwtConfig.cookie.name, {
      ...jwtConfig.cookie.options,
      maxAge: 0,
    });

    return response.success(res, null, 'Logout berhasil');
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /auth/change-password
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);

    // Clear refresh token cookie to force re-login
    res.clearCookie(jwtConfig.cookie.name, {
      ...jwtConfig.cookie.options,
      maxAge: 0,
    });

    return response.success(res, null, 'Password berhasil diubah. Silakan login kembali.');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/me
 */
async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return response.success(res, user, 'Data profil berhasil diambil');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  refreshToken,
  logout,
  changePassword,
  getMe,
};

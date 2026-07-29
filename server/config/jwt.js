module.exports = {
  accessToken: {
    secret: process.env.JWT_SECRET || 'default-dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'default-dev-refresh-secret-change-in-production',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookie: {
    name: 'siati_refresh_token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    },
  },
};

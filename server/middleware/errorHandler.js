/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, _next) {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Knex/PostgreSQL errors
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Data sudah ada (duplikasi).',
      code: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referensi data tidak ditemukan.',
      code: 'FOREIGN_KEY_VIOLATION',
    });
  }

  // Custom application error
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code || 'APP_ERROR',
    });
  }

  // Default 500
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server.'
      : err.message,
    code: 'SERVER_ERROR',
  });
}

/**
 * Custom application error
 */
class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };

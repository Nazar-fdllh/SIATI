/**
 * Standardized API response helpers
 */

function success(res, data = null, message = 'Berhasil', statusCode = 200) {
  const response = {
    success: true,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
}

function created(res, data = null, message = 'Data berhasil dibuat') {
  return success(res, data, message, 201);
}

function paginated(res, data, meta, message = 'Data berhasil diambil') {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
}

function error(res, message = 'Terjadi kesalahan', statusCode = 400, code = 'APP_ERROR') {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}

module.exports = { success, created, paginated, error };

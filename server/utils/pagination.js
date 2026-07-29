const { PAGINATION } = require('@siati/shared');

/**
 * Parse pagination params from query string
 */
function parsePagination(query) {
  let page = parseInt(query.page) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = PAGINATION.DEFAULT_LIMIT;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build pagination metadata
 */
function buildMeta(page, limit, total) {
  return {
    page,
    limit,
    total: parseInt(total),
    totalPages: Math.ceil(parseInt(total) / limit),
  };
}

module.exports = { parsePagination, buildMeta };

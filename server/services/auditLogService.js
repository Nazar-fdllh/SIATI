const { db } = require('../config/database');

/**
 * Get audit logs with pagination
 */
async function getLogs({ page = 1, limit = 20, module, action, userId }) {
  const offset = (page - 1) * limit;

  let query = db('audit_logs')
    .leftJoin('users', 'audit_logs.user_id', 'users.id')
    .leftJoin('employees', 'users.id', 'employees.user_id')
    .select(
      'audit_logs.*',
      'employees.full_name as user_name',
      'users.email as user_email'
    )
    .orderBy('audit_logs.created_at', 'desc');

  if (module) query = query.where('audit_logs.module', module);
  if (action) query = query.where('audit_logs.action', action);
  if (userId) query = query.where('audit_logs.user_id', userId);

  const countQuery = query.clone();
  const [{ count }] = await countQuery.clearSelect().clearOrder().count('* as count');
  const data = await query.limit(limit).offset(offset);

  return { data, meta: { page, limit, total: parseInt(count) } };
}

module.exports = {
  getLogs,
};

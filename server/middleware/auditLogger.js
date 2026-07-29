const { db } = require('../config/database');

/**
 * Middleware: Log actions to audit_logs table
 */
function auditLog(action, module) {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      // Only log successful operations
      if (body && body.success && req.user) {
        const logEntry = {
          user_id: req.user.id,
          action,
          module,
          entity_type: req.params.id ? module : null,
          entity_id: req.params.id || null,
          old_values: req._auditOldValues || null,
          new_values: req.body && Object.keys(req.body).length > 0
            ? JSON.stringify(req.body)
            : null,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent'),
          description: `${req.user.email} - ${action} ${module}`,
        };

        // Fire and forget - don't block the response
        db('audit_logs').insert(logEntry).catch((err) => {
          console.error('Audit log error:', err.message);
        });
      }

      return originalJson(body);
    };

    next();
  };
}

module.exports = { auditLog };

/**
 * Joi validation middleware
 * Usage: validate(schema) or validate(schema, 'query')
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: { label: false },
      },
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors,
        code: 'VALIDATION_ERROR',
      });
    }

    // Replace request data with validated/sanitized values
    req[source] = value;
    next();
  };
}

module.exports = { validate };

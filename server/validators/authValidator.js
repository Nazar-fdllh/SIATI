const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'any.required': 'Password wajib diisi',
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Password lama wajib diisi',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password baru minimal 8 karakter',
      'string.pattern.base': 'Password harus mengandung huruf besar, huruf kecil, dan angka',
      'any.required': 'Password baru wajib diisi',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Konfirmasi password tidak cocok',
    'any.required': 'Konfirmasi password wajib diisi',
  }),
});

module.exports = { loginSchema, changePasswordSchema };

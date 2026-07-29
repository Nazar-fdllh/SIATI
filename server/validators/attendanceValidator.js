const Joi = require('joi');

const checkInSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  ipAddress: Joi.string().ip().optional(),
  photoUrl: Joi.string().uri().optional(),
  photoSize: Joi.number().optional(),
  notes: Joi.string().max(255).optional(),
});

const checkOutSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  ipAddress: Joi.string().ip().optional(),
  photoUrl: Joi.string().uri().optional(),
  photoSize: Joi.number().optional(),
});

module.exports = {
  checkInSchema,
  checkOutSchema,
};

const Joi = require('joi');

const createLeaveSchema = Joi.object({
  leaveTypeId: Joi.string().uuid().required().messages({
    'any.required': 'Tipe cuti wajib diisi',
  }),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Tanggal mulai wajib diisi',
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
    'date.min': 'Tanggal selesai tidak boleh kurang dari tanggal mulai',
    'any.required': 'Tanggal selesai wajib diisi',
  }),
  reason: Joi.string().required().messages({
    'any.required': 'Alasan cuti wajib diisi',
  }),
  urgency: Joi.string().valid('normal', 'urgent').default('normal'),
  delegateTo: Joi.string().uuid().optional(),
});

const approveLeaveSchema = Joi.object({
  remarks: Joi.string().optional(),
});

const rejectLeaveSchema = Joi.object({
  remarks: Joi.string().required().messages({
    'any.required': 'Alasan penolakan wajib diisi',
  }),
});

module.exports = {
  createLeaveSchema,
  approveLeaveSchema,
  rejectLeaveSchema,
};

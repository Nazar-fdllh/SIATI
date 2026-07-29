const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('super_admin', 'hrd', 'supervisor', 'karyawan').required(),
  employeeCode: Joi.string().required(),
  fullName: Joi.string().required(),
  nickname: Joi.string().optional(),
  phone: Joi.string().optional(),
  emergencyContactName: Joi.string().optional(),
  emergencyContactPhone: Joi.string().optional(),
  birthDate: Joi.date().iso().optional(),
  gender: Joi.string().valid('male', 'female').optional(),
  address: Joi.string().optional(),
  departmentId: Joi.string().uuid().optional(),
  positionId: Joi.string().uuid().optional(),
  shiftId: Joi.string().uuid().optional(),
  supervisorId: Joi.string().uuid().optional(),
  employmentStatus: Joi.string().valid('active', 'probation', 'contract', 'resigned', 'terminated').optional(),
  joinDate: Joi.date().iso().required(),
});

const updateEmployeeSchema = Joi.object({
  fullName: Joi.string().optional(),
  nickname: Joi.string().optional(),
  phone: Joi.string().optional(),
  emergencyContactName: Joi.string().optional(),
  emergencyContactPhone: Joi.string().optional(),
  birthDate: Joi.date().iso().optional(),
  gender: Joi.string().valid('male', 'female').optional(),
  address: Joi.string().optional(),
  departmentId: Joi.string().uuid().optional(),
  positionId: Joi.string().uuid().optional(),
  shiftId: Joi.string().uuid().optional(),
  supervisorId: Joi.string().uuid().optional(),
  employmentStatus: Joi.string().valid('active', 'probation', 'contract', 'resigned', 'terminated').optional(),
  joinDate: Joi.date().iso().optional(),
  resignDate: Joi.date().iso().optional(),
});

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};

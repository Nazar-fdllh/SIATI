const { db } = require('../config/database');
const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all employees with pagination
 */
async function getAllEmployees({ page = 1, limit = 20, search, departmentId, status }) {
  const offset = (page - 1) * limit;

  let query = db('employees')
    .leftJoin('departments', 'employees.department_id', 'departments.id')
    .leftJoin('positions', 'employees.position_id', 'positions.id')
    .leftJoin('shifts', 'employees.shift_id', 'shifts.id')
    .leftJoin('users', 'employees.user_id', 'users.id')
    .select(
      'employees.*',
      'departments.name as department_name',
      'positions.name as position_name',
      'shifts.name as shift_name',
      'users.email',
      'users.is_active as user_active'
    )
    .orderBy('employees.full_name');

  if (search) {
    query = query.where(function () {
      this.where('employees.full_name', 'ilike', `%${search}%`)
        .orWhere('employees.employee_code', 'ilike', `%${search}%`)
        .orWhere('users.email', 'ilike', `%${search}%`);
    });
  }
  if (departmentId) query = query.where('employees.department_id', departmentId);
  if (status) query = query.where('employees.employment_status', status);

  const countQuery = db('employees');
  if (search) countQuery.where('full_name', 'ilike', `%${search}%`);
  if (departmentId) countQuery.where('department_id', departmentId);
  if (status) countQuery.where('employment_status', status);

  const [{ count }] = await countQuery.count('* as count');
  const data = await query.limit(limit).offset(offset);

  return { data, meta: { page, limit, total: parseInt(count) } };
}

/**
 * Get employee by ID
 */
async function getEmployeeById(id) {
  const employee = await db('employees')
    .leftJoin('departments', 'employees.department_id', 'departments.id')
    .leftJoin('positions', 'employees.position_id', 'positions.id')
    .leftJoin('shifts', 'employees.shift_id', 'shifts.id')
    .leftJoin('users', 'employees.user_id', 'users.id')
    .leftJoin('roles', 'users.role_id', 'roles.id')
    .leftJoin('employees as supervisor', 'employees.supervisor_id', 'supervisor.id')
    .select(
      'employees.*',
      'departments.name as department_name',
      'departments.code as department_code',
      'positions.name as position_name',
      'positions.level as position_level',
      'shifts.name as shift_name',
      'shifts.start_time',
      'shifts.end_time',
      'users.email',
      'users.is_active as user_active',
      'users.last_login',
      'roles.name as role_name',
      'supervisor.full_name as supervisor_name'
    )
    .where('employees.id', id)
    .first();

  if (!employee) throw new AppError('Karyawan tidak ditemukan.', 404);
  return employee;
}

/**
 * Get employee by user ID
 */
async function getEmployeeByUserId(userId) {
  return db('employees').where('user_id', userId).first();
}

/**
 * Create employee + user account
 */
async function createEmployee(data) {
  const trx = await db.transaction();

  try {
    // Create user account
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(data.password || 'Siati@123', salt);

    const role = await trx('roles').where('name', data.role || 'karyawan').first();
    if (!role) throw new AppError('Role tidak ditemukan.', 400);

    const [user] = await trx('users').insert({
      email: data.email,
      password_hash: hash,
      role_id: role.id,
      is_active: true,
    }).returning('id');

    // Create employee
    const [employee] = await trx('employees').insert({
      user_id: user.id,
      employee_code: data.employeeCode,
      full_name: data.fullName,
      nickname: data.nickname || null,
      phone: data.phone || null,
      emergency_contact_name: data.emergencyContactName || null,
      emergency_contact_phone: data.emergencyContactPhone || null,
      birth_date: data.birthDate || null,
      gender: data.gender || null,
      address: data.address || null,
      department_id: data.departmentId || null,
      position_id: data.positionId || null,
      shift_id: data.shiftId || null,
      supervisor_id: data.supervisorId || null,
      employment_status: data.employmentStatus || 'active',
      join_date: data.joinDate,
    }).returning('*');

    // Initialize leave balances
    const currentYear = new Date().getFullYear();
    const leaveTypes = await trx('leave_types').where('is_active', true);
    const balances = leaveTypes.map((lt) => ({
      employee_id: employee.id,
      leave_type_id: lt.id,
      year: currentYear,
      total_balance: lt.default_balance,
      used: 0,
      remaining: lt.default_balance,
    }));
    if (balances.length > 0) await trx('leave_balances').insert(balances);

    await trx.commit();
    return employee;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

/**
 * Update employee
 */
async function updateEmployee(id, data) {
  const employee = await db('employees').where('id', id).first();
  if (!employee) throw new AppError('Karyawan tidak ditemukan.', 404);

  const updateData = {};
  if (data.fullName) updateData.full_name = data.fullName;
  if (data.nickname !== undefined) updateData.nickname = data.nickname;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.emergencyContactName !== undefined) updateData.emergency_contact_name = data.emergencyContactName;
  if (data.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = data.emergencyContactPhone;
  if (data.birthDate !== undefined) updateData.birth_date = data.birthDate;
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.departmentId !== undefined) updateData.department_id = data.departmentId;
  if (data.positionId !== undefined) updateData.position_id = data.positionId;
  if (data.shiftId !== undefined) updateData.shift_id = data.shiftId;
  if (data.supervisorId !== undefined) updateData.supervisor_id = data.supervisorId;
  if (data.employmentStatus !== undefined) updateData.employment_status = data.employmentStatus;
  if (data.joinDate !== undefined) updateData.join_date = data.joinDate;
  if (data.resignDate !== undefined) updateData.resign_date = data.resignDate;

  updateData.updated_at = new Date();

  const [updated] = await db('employees').where('id', id).update(updateData).returning('*');
  return updated;
}

/**
 * Get departments
 */
async function getDepartments() {
  return db('departments').where('is_active', true).orderBy('name');
}

/**
 * Get positions
 */
async function getPositions() {
  return db('positions').where('is_active', true).orderBy('name');
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  getEmployeeByUserId,
  createEmployee,
  updateEmployee,
  getDepartments,
  getPositions,
};

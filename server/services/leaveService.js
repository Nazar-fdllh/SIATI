const { db } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { formatDate, calculateWorkDays } = require('@siati/shared');

/**
 * Create leave request
 */
async function createLeaveRequest(employeeId, data) {
  // Validate leave type
  const leaveType = await db('leave_types').where('id', data.leaveTypeId).where('is_active', true).first();
  if (!leaveType) throw new AppError('Tipe cuti tidak ditemukan.', 404);

  // Get holidays in range for calculating work days
  const holidays = await db('holidays')
    .whereBetween('holiday_date', [data.startDate, data.endDate])
    .pluck('holiday_date');

  const totalDays = calculateWorkDays(data.startDate, data.endDate, holidays);
  if (totalDays <= 0) throw new AppError('Tanggal cuti tidak valid (tidak ada hari kerja).', 400);

  // Check leave balance
  const currentYear = new Date().getFullYear();
  const balance = await db('leave_balances')
    .where({ employee_id: employeeId, leave_type_id: data.leaveTypeId, year: currentYear })
    .first();

  if (balance && parseFloat(balance.remaining) < totalDays) {
    throw new AppError(`Saldo cuti tidak cukup. Sisa: ${balance.remaining} hari, dibutuhkan: ${totalDays} hari.`, 400, 'INSUFFICIENT_BALANCE');
  }

  // Check overlapping leave requests
  const overlap = await db('leave_requests')
    .where('employee_id', employeeId)
    .whereIn('status', ['pending', 'approved_l1', 'approved'])
    .where(function () {
      this.whereBetween('start_date', [data.startDate, data.endDate])
        .orWhereBetween('end_date', [data.startDate, data.endDate])
        .orWhere(function () {
          this.where('start_date', '<=', data.startDate).andWhere('end_date', '>=', data.endDate);
        });
    })
    .first();

  if (overlap) throw new AppError('Tanggal cuti bentrok dengan pengajuan cuti lainnya.', 400, 'OVERLAP');

  // Determine first approver (supervisor)
  const employee = await db('employees').where('id', employeeId).first();
  const approver = employee.supervisor_id
    ? await db('employees').where('id', employee.supervisor_id).first()
    : await getHRDEmployee();

  // Create leave request
  const [leaveRequest] = await db('leave_requests').insert({
    employee_id: employeeId,
    leave_type_id: data.leaveTypeId,
    start_date: data.startDate,
    end_date: data.endDate,
    total_days: totalDays,
    status: 'pending',
    reason: data.reason,
    urgency: data.urgency || 'normal',
    current_approver_id: approver ? approver.id : null,
    approval_level: 1,
    delegate_to: data.delegateTo || null,
  }).returning('*');

  // Create first approval record
  if (approver) {
    await db('approvals').insert({
      leave_request_id: leaveRequest.id,
      approver_id: approver.id,
      approval_order: 1,
      status: 'pending',
    });
  }

  // Create notification for approver
  if (approver) {
    const approverUser = await db('users')
      .join('employees', 'users.id', 'employees.user_id')
      .where('employees.id', approver.id)
      .select('users.id')
      .first();

    if (approverUser) {
      await db('notifications').insert({
        user_id: approverUser.id,
        type: 'leave_request',
        title: 'Pengajuan Cuti Baru',
        message: `${employee.full_name} mengajukan ${leaveType.name} (${totalDays} hari) pada ${data.startDate} s/d ${data.endDate}.`,
        link: `/leave/approval`,
      });
    }
  }

  return { ...leaveRequest, leave_type: leaveType.name, total_days: totalDays };
}

/**
 * Get employee's leave requests
 */
async function getMyLeaveRequests(employeeId, { page = 1, limit = 20, status, year }) {
  const offset = (page - 1) * limit;

  let query = db('leave_requests')
    .join('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
    .select(
      'leave_requests.*',
      'leave_types.name as leave_type_name',
      'leave_types.code as leave_type_code'
    )
    .where('leave_requests.employee_id', employeeId)
    .orderBy('leave_requests.created_at', 'desc');

  if (status) query = query.where('leave_requests.status', status);
  if (year) query = query.whereRaw('EXTRACT(YEAR FROM leave_requests.start_date) = ?', [year]);

  const countQuery = query.clone();
  const [{ count }] = await countQuery.clearSelect().clearOrder().count('* as count');
  const data = await query.limit(limit).offset(offset);

  return { data, meta: { page, limit, total: parseInt(count) } };
}

/**
 * Get pending approvals for approver
 */
async function getPendingApprovals(approverId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  // Get employee ID for the approver
  const approverEmployee = await db('employees').where('id', approverId).first();
  if (!approverEmployee) {
    // Try finding by user_id
    const emp = await db('employees').where('user_id', approverId).first();
    if (!emp) throw new AppError('Data karyawan tidak ditemukan.', 404);
    approverId = emp.id;
  }

  const query = db('leave_requests')
    .join('employees', 'leave_requests.employee_id', 'employees.id')
    .join('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
    .leftJoin('departments', 'employees.department_id', 'departments.id')
    .select(
      'leave_requests.*',
      'employees.full_name',
      'employees.employee_code',
      'employees.photo_url as employee_photo',
      'leave_types.name as leave_type_name',
      'leave_types.code as leave_type_code',
      'departments.name as department_name'
    )
    .where('leave_requests.current_approver_id', approverId)
    .whereIn('leave_requests.status', ['pending', 'approved_l1'])
    .orderBy('leave_requests.created_at', 'asc');

  const [{ count }] = await query.clone().clearSelect().clearOrder().count('* as count');
  const data = await query.limit(limit).offset(offset);

  return { data, meta: { page, limit, total: parseInt(count) } };
}

/**
 * Approve leave request
 */
async function approveLeave(leaveRequestId, approverId, remarks) {
  const leaveRequest = await db('leave_requests').where('id', leaveRequestId).first();
  if (!leaveRequest) throw new AppError('Pengajuan cuti tidak ditemukan.', 404);

  // Get approver employee
  let approverEmpId = approverId;
  const approverEmp = await db('employees').where('user_id', approverId).first();
  if (approverEmp) approverEmpId = approverEmp.id;

  if (leaveRequest.current_approver_id !== approverEmpId) {
    throw new AppError('Anda tidak memiliki akses untuk menyetujui cuti ini.', 403);
  }

  // Update approval record
  await db('approvals')
    .where({ leave_request_id: leaveRequestId, approver_id: approverEmpId })
    .update({ status: 'approved', remarks, acted_at: new Date() });

  // Determine next step based on approval level
  if (leaveRequest.approval_level === 1 && parseFloat(leaveRequest.total_days) > 3) {
    // Need HRD approval (level 2)
    const hrdEmployee = await getHRDEmployee();

    if (hrdEmployee && hrdEmployee.id !== approverEmpId) {
      await db('leave_requests').where('id', leaveRequestId).update({
        status: 'approved_l1',
        current_approver_id: hrdEmployee.id,
        approval_level: 2,
        updated_at: new Date(),
      });

      await db('approvals').insert({
        leave_request_id: leaveRequestId,
        approver_id: hrdEmployee.id,
        approval_order: 2,
        status: 'pending',
      });

      // Notify HRD
      const hrdUser = await db('users').join('employees', 'users.id', 'employees.user_id')
        .where('employees.id', hrdEmployee.id).select('users.id').first();
      if (hrdUser) {
        await db('notifications').insert({
          user_id: hrdUser.id,
          type: 'leave_approval',
          title: 'Approval Cuti Level 2',
          message: `Pengajuan cuti memerlukan persetujuan Anda.`,
          link: '/leave/approval',
        });
      }

      return { status: 'approved_l1', message: 'Disetujui oleh Supervisor. Menunggu persetujuan HRD.' };
    }
  }

  // Final approval
  await db('leave_requests').where('id', leaveRequestId).update({
    status: 'approved',
    current_approver_id: null,
    updated_at: new Date(),
  });

  // Deduct leave balance
  const currentYear = new Date().getFullYear();
  await db('leave_balances')
    .where({ employee_id: leaveRequest.employee_id, leave_type_id: leaveRequest.leave_type_id, year: currentYear })
    .update({
      used: db.raw('used + ?', [leaveRequest.total_days]),
      remaining: db.raw('remaining - ?', [leaveRequest.total_days]),
      updated_at: new Date(),
    });

  // Create attendance records for leave dates
  const start = new Date(leaveRequest.start_date);
  const end = new Date(leaveRequest.end_date);
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      await db('attendance')
        .insert({
          employee_id: leaveRequest.employee_id,
          attendance_date: formatDate(current),
          status: 'leave',
          notes: `Cuti disetujui`,
        })
        .onConflict(['employee_id', 'attendance_date'])
        .merge({ status: 'leave', notes: 'Cuti disetujui', updated_at: new Date() });
    }
    current.setDate(current.getDate() + 1);
  }

  // Notify employee
  const employeeUser = await db('users').join('employees', 'users.id', 'employees.user_id')
    .where('employees.id', leaveRequest.employee_id).select('users.id').first();
  if (employeeUser) {
    await db('notifications').insert({
      user_id: employeeUser.id,
      type: 'leave_approval',
      title: 'Cuti Disetujui ✅',
      message: `Pengajuan cuti Anda telah disetujui.`,
      link: '/leave/history',
    });
  }

  return { status: 'approved', message: 'Cuti berhasil disetujui.' };
}

/**
 * Reject leave request
 */
async function rejectLeave(leaveRequestId, approverId, remarks) {
  const leaveRequest = await db('leave_requests').where('id', leaveRequestId).first();
  if (!leaveRequest) throw new AppError('Pengajuan cuti tidak ditemukan.', 404);

  let approverEmpId = approverId;
  const approverEmp = await db('employees').where('user_id', approverId).first();
  if (approverEmp) approverEmpId = approverEmp.id;

  await db('approvals')
    .where({ leave_request_id: leaveRequestId, approver_id: approverEmpId })
    .update({ status: 'rejected', remarks, acted_at: new Date() });

  await db('leave_requests').where('id', leaveRequestId).update({
    status: 'rejected',
    current_approver_id: null,
    updated_at: new Date(),
  });

  // Notify employee
  const employeeUser = await db('users').join('employees', 'users.id', 'employees.user_id')
    .where('employees.id', leaveRequest.employee_id).select('users.id').first();
  if (employeeUser) {
    await db('notifications').insert({
      user_id: employeeUser.id,
      type: 'leave_approval',
      title: 'Cuti Ditolak ❌',
      message: `Pengajuan cuti Anda ditolak. Alasan: ${remarks || 'Tidak ada keterangan'}`,
      link: '/leave/history',
    });
  }

  return { status: 'rejected', message: 'Cuti ditolak.' };
}

/**
 * Get leave balances
 */
async function getLeaveBalances(employeeId, year) {
  const targetYear = year || new Date().getFullYear();

  const balances = await db('leave_balances')
    .join('leave_types', 'leave_balances.leave_type_id', 'leave_types.id')
    .select(
      'leave_balances.*',
      'leave_types.name as leave_type_name',
      'leave_types.code as leave_type_code',
      'leave_types.is_paid'
    )
    .where({ 'leave_balances.employee_id': employeeId, 'leave_balances.year': targetYear })
    .orderBy('leave_types.name');

  // If no balances, initialize them
  if (balances.length === 0) {
    const leaveTypes = await db('leave_types').where('is_active', true);
    const inserts = leaveTypes.map((lt) => ({
      employee_id: employeeId,
      leave_type_id: lt.id,
      year: targetYear,
      total_balance: lt.default_balance,
      used: 0,
      remaining: lt.default_balance,
    }));

    if (inserts.length > 0) {
      await db('leave_balances').insert(inserts);
      return getLeaveBalances(employeeId, targetYear);
    }
  }

  return balances;
}

/**
 * Get leave types
 */
async function getLeaveTypes() {
  return db('leave_types').where('is_active', true).orderBy('name');
}

/**
 * Get leave request detail with approval history
 */
async function getLeaveDetail(leaveRequestId) {
  const leaveRequest = await db('leave_requests')
    .join('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
    .join('employees', 'leave_requests.employee_id', 'employees.id')
    .leftJoin('departments', 'employees.department_id', 'departments.id')
    .select(
      'leave_requests.*',
      'leave_types.name as leave_type_name',
      'leave_types.code as leave_type_code',
      'employees.full_name',
      'employees.employee_code',
      'departments.name as department_name'
    )
    .where('leave_requests.id', leaveRequestId)
    .first();

  if (!leaveRequest) throw new AppError('Pengajuan cuti tidak ditemukan.', 404);

  const approvals = await db('approvals')
    .join('employees', 'approvals.approver_id', 'employees.id')
    .select('approvals.*', 'employees.full_name as approver_name')
    .where('approvals.leave_request_id', leaveRequestId)
    .orderBy('approvals.approval_order');

  const documents = await db('leave_documents')
    .where('leave_request_id', leaveRequestId);

  return { ...leaveRequest, approvals, documents };
}

/**
 * Helper: Get an HRD employee
 */
async function getHRDEmployee() {
  const hrdUser = await db('users')
    .join('roles', 'users.role_id', 'roles.id')
    .join('employees', 'users.id', 'employees.user_id')
    .where('roles.name', 'hrd')
    .where('users.is_active', true)
    .select('employees.id')
    .first();

  if (!hrdUser) {
    // Fall back to super_admin
    const admin = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .join('employees', 'users.id', 'employees.user_id')
      .where('roles.name', 'super_admin')
      .select('employees.id')
      .first();
    return admin || null;
  }
  return hrdUser;
}

module.exports = {
  createLeaveRequest,
  getMyLeaveRequests,
  getPendingApprovals,
  approveLeave,
  rejectLeave,
  getLeaveBalances,
  getLeaveTypes,
  getLeaveDetail,
};

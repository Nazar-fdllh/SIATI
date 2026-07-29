const { db } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { formatDate } = require('@siati/shared');

/**
 * Check-in attendance
 */
async function checkIn(employeeId, data) {
  const today = formatDate(new Date());

  // Check if already checked in today
  const existing = await db('attendance')
    .where({ employee_id: employeeId, attendance_date: today })
    .first();

  if (existing && existing.check_in_time) {
    throw new AppError('Anda sudah check-in hari ini.', 400, 'ALREADY_CHECKED_IN');
  }

  // Get employee shift
  const employee = await db('employees')
    .leftJoin('shifts', 'employees.shift_id', 'shifts.id')
    .select('employees.id', 'shifts.start_time', 'shifts.tolerance_minutes', 'shifts.name as shift_name')
    .where('employees.id', employeeId)
    .first();

  if (!employee) {
    throw new AppError('Data karyawan tidak ditemukan.', 404, 'NOT_FOUND');
  }

  // Determine status (present or late)
  const now = new Date();
  let status = 'present';

  if (employee.start_time) {
    const [shiftHour, shiftMin] = employee.start_time.split(':').map(Number);
    const shiftStart = new Date(now);
    shiftStart.setHours(shiftHour, shiftMin, 0, 0);

    const toleranceMs = (employee.tolerance_minutes || 15) * 60 * 1000;
    if (now.getTime() > shiftStart.getTime() + toleranceMs) {
      status = 'late';
    }
  }

  // Validate geolocation
  let isValidLocation = true;
  if (data.latitude && data.longitude) {
    isValidLocation = await validateLocation(data.latitude, data.longitude);
  }

  const attendanceData = {
    employee_id: employeeId,
    attendance_date: today,
    check_in_time: now,
    status,
    check_in_lat: data.latitude || null,
    check_in_lng: data.longitude || null,
    check_in_ip: data.ipAddress || null,
    is_valid_location: isValidLocation,
    notes: data.notes || null,
    created_by: data.userId,
  };

  let attendance;
  if (existing) {
    [attendance] = await db('attendance')
      .where('id', existing.id)
      .update({ ...attendanceData, updated_at: new Date() })
      .returning('*');
  } else {
    [attendance] = await db('attendance')
      .insert(attendanceData)
      .returning('*');
  }

  // Save photo if provided
  if (data.photoUrl) {
    await db('attendance_photos').insert({
      attendance_id: attendance.id,
      photo_type: 'check_in',
      photo_url: data.photoUrl,
      file_size: data.photoSize || null,
    });
  }

  return {
    ...attendance,
    shift_name: employee.shift_name,
    is_late: status === 'late',
  };
}

/**
 * Check-out attendance
 */
async function checkOut(employeeId, data) {
  const today = formatDate(new Date());

  const attendance = await db('attendance')
    .where({ employee_id: employeeId, attendance_date: today })
    .first();

  if (!attendance) {
    throw new AppError('Anda belum check-in hari ini.', 400, 'NOT_CHECKED_IN');
  }

  if (attendance.check_out_time) {
    throw new AppError('Anda sudah check-out hari ini.', 400, 'ALREADY_CHECKED_OUT');
  }

  const now = new Date();
  const checkInTime = new Date(attendance.check_in_time);
  const workDurationMinutes = Math.round((now - checkInTime) / 60000);

  // Calculate overtime (assume 8 hours = 480 minutes standard)
  const overtimeMinutes = Math.max(0, workDurationMinutes - 480);

  const [updated] = await db('attendance')
    .where('id', attendance.id)
    .update({
      check_out_time: now,
      check_out_lat: data.latitude || null,
      check_out_lng: data.longitude || null,
      check_out_ip: data.ipAddress || null,
      work_duration_minutes: workDurationMinutes,
      overtime_minutes: overtimeMinutes,
      updated_by: data.userId,
      updated_at: new Date(),
    })
    .returning('*');

  // Save checkout photo
  if (data.photoUrl) {
    await db('attendance_photos').insert({
      attendance_id: attendance.id,
      photo_type: 'check_out',
      photo_url: data.photoUrl,
      file_size: data.photoSize || null,
    });
  }

  return {
    ...updated,
    work_hours: Math.floor(workDurationMinutes / 60),
    work_minutes: workDurationMinutes % 60,
  };
}

/**
 * Get today's attendance for an employee
 */
async function getTodayAttendance(employeeId) {
  const today = formatDate(new Date());

  const attendance = await db('attendance')
    .leftJoin('attendance_photos', 'attendance.id', 'attendance_photos.attendance_id')
    .select(
      'attendance.*',
      db.raw(`json_agg(json_build_object('id', attendance_photos.id, 'photo_type', attendance_photos.photo_type, 'photo_url', attendance_photos.photo_url)) FILTER (WHERE attendance_photos.id IS NOT NULL) as photos`)
    )
    .where({ 'attendance.employee_id': employeeId, 'attendance.attendance_date': today })
    .groupBy('attendance.id')
    .first();

  return attendance || null;
}

/**
 * Get attendance history for an employee
 */
async function getHistory(employeeId, { page = 1, limit = 20, startDate, endDate, status }) {
  const offset = (page - 1) * limit;

  let query = db('attendance')
    .where('employee_id', employeeId)
    .orderBy('attendance_date', 'desc');

  if (startDate) query = query.where('attendance_date', '>=', startDate);
  if (endDate) query = query.where('attendance_date', '<=', endDate);
  if (status) query = query.where('status', status);

  const [{ count }] = await query.clone().count('* as count');
  const data = await query.limit(limit).offset(offset);

  return {
    data,
    meta: { page, limit, total: parseInt(count) },
  };
}

/**
 * Get all attendance (for HRD/Admin)
 */
async function getAllAttendance({ page = 1, limit = 20, date, departmentId, status }) {
  const offset = (page - 1) * limit;
  const targetDate = date || formatDate(new Date());

  let query = db('attendance')
    .join('employees', 'attendance.employee_id', 'employees.id')
    .leftJoin('departments', 'employees.department_id', 'departments.id')
    .leftJoin('positions', 'employees.position_id', 'positions.id')
    .select(
      'attendance.*',
      'employees.full_name',
      'employees.employee_code',
      'employees.photo_url as employee_photo',
      'departments.name as department_name',
      'positions.name as position_name'
    )
    .where('attendance.attendance_date', targetDate)
    .orderBy('attendance.check_in_time', 'asc');

  if (departmentId) query = query.where('employees.department_id', departmentId);
  if (status) query = query.where('attendance.status', status);

  const countQuery = db('attendance')
    .join('employees', 'attendance.employee_id', 'employees.id')
    .where('attendance.attendance_date', targetDate);
  if (departmentId) countQuery.where('employees.department_id', departmentId);
  if (status) countQuery.where('attendance.status', status);

  const [{ count }] = await countQuery.count('* as count');
  const data = await query.limit(limit).offset(offset);

  return {
    data,
    meta: { page, limit, total: parseInt(count) },
  };
}

/**
 * Get team attendance (for Supervisor)
 */
async function getTeamAttendance(supervisorId, { date }) {
  const targetDate = date || formatDate(new Date());

  // Get employee ID from supervisor's user
  const supervisor = await db('employees').where('id', supervisorId).first();
  if (!supervisor) throw new AppError('Data supervisor tidak ditemukan.', 404);

  const teamMembers = await db('employees')
    .where('supervisor_id', supervisor.id)
    .orWhere('id', supervisor.id)
    .select('id', 'full_name', 'employee_code', 'photo_url');

  const teamIds = teamMembers.map((m) => m.id);

  const attendance = await db('attendance')
    .whereIn('employee_id', teamIds)
    .where('attendance_date', targetDate);

  // Merge team members with their attendance
  const result = teamMembers.map((member) => {
    const att = attendance.find((a) => a.employee_id === member.id);
    return {
      ...member,
      attendance: att || null,
      status: att ? att.status : 'absent',
    };
  });

  return result;
}

/**
 * Get monthly summary
 */
async function getMonthlySummary(employeeId, year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const records = await db('attendance')
    .where('employee_id', employeeId)
    .whereBetween('attendance_date', [startDate, endDate])
    .orderBy('attendance_date', 'asc');

  const summary = {
    total_days: records.length,
    present: records.filter((r) => r.status === 'present').length,
    late: records.filter((r) => r.status === 'late').length,
    sick: records.filter((r) => r.status === 'sick').length,
    permit: records.filter((r) => r.status === 'permit').length,
    leave: records.filter((r) => r.status === 'leave').length,
    wfh: records.filter((r) => r.status === 'wfh').length,
    absent: records.filter((r) => r.status === 'absent').length,
    total_work_hours: Math.round(records.reduce((sum, r) => sum + (r.work_duration_minutes || 0), 0) / 60),
    total_overtime_hours: Math.round(records.reduce((sum, r) => sum + (r.overtime_minutes || 0), 0) / 60),
    records,
  };

  return summary;
}

/**
 * Validate location against office coordinates
 */
async function validateLocation(lat, lng) {
  const config = await db('system_config')
    .whereIn('key', ['office_latitude', 'office_longitude', 'geofence_radius_meters'])
    .select('key', 'value');

  const configMap = {};
  config.forEach((c) => { configMap[c.key] = parseFloat(c.value); });

  const officeLat = configMap.office_latitude || -6.2;
  const officeLng = configMap.office_longitude || 106.816666;
  const radius = configMap.geofence_radius_meters || 200;

  const distance = haversineDistance(lat, lng, officeLat, officeLng);
  return distance <= radius;
}

/**
 * Haversine formula to calculate distance between two coordinates
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Get real-time attendance monitor data
 */
async function getMonitorData(date) {
  const targetDate = date || formatDate(new Date());

  const totalEmployees = await db('employees')
    .where('employment_status', 'active')
    .count('* as count')
    .first();

  const attendanceSummary = await db('attendance')
    .where('attendance_date', targetDate)
    .select('status')
    .count('* as count')
    .groupBy('status');

  const summaryMap = {};
  attendanceSummary.forEach((s) => { summaryMap[s.status] = parseInt(s.count); });

  const checkedIn = await db('attendance')
    .where('attendance_date', targetDate)
    .whereNotNull('check_in_time')
    .count('* as count')
    .first();

  const notCheckedIn = parseInt(totalEmployees.count) - parseInt(checkedIn.count);

  return {
    date: targetDate,
    total_employees: parseInt(totalEmployees.count),
    checked_in: parseInt(checkedIn.count),
    not_checked_in: notCheckedIn,
    present: summaryMap.present || 0,
    late: summaryMap.late || 0,
    sick: summaryMap.sick || 0,
    permit: summaryMap.permit || 0,
    leave: summaryMap.leave || 0,
    wfh: summaryMap.wfh || 0,
    absent: summaryMap.absent || 0,
  };
}

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getHistory,
  getAllAttendance,
  getTeamAttendance,
  getMonthlySummary,
  getMonitorData,
  validateLocation,
};

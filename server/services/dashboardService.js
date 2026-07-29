const { db } = require('../config/database');
const { formatDate } = require('@siati/shared');

/**
 * Get dashboard statistics
 */
async function getDashboardStats(userId, roleName) {
  const today = formatDate(new Date());
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Total active employees
  const [{ total_employees }] = await db('employees')
    .where('employment_status', 'active').count('* as total_employees');

  // Today's attendance
  const todayStats = await db('attendance')
    .where('attendance_date', today)
    .select('status')
    .count('* as count')
    .groupBy('status');

  const statsMap = {};
  todayStats.forEach((s) => { statsMap[s.status] = parseInt(s.count); });

  const totalPresent = (statsMap.present || 0) + (statsMap.late || 0) + (statsMap.wfh || 0);
  const totalAbsent = parseInt(total_employees) - totalPresent - (statsMap.leave || 0) - (statsMap.sick || 0) - (statsMap.permit || 0);

  // Pending leave requests
  const [{ pending_leaves }] = await db('leave_requests')
    .whereIn('status', ['pending', 'approved_l1'])
    .count('* as pending_leaves');

  // Monthly attendance rate
  const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const [{ monthly_present }] = await db('attendance')
    .where('attendance_date', '>=', startOfMonth)
    .where('attendance_date', '<=', today)
    .whereIn('status', ['present', 'late', 'wfh'])
    .count('* as monthly_present');

  const workDaysSoFar = await getWorkDaysInRange(startOfMonth, today);
  const attendanceRate = workDaysSoFar > 0
    ? Math.round((parseInt(monthly_present) / (workDaysSoFar * parseInt(total_employees))) * 100)
    : 0;

  // On-time rate
  const [{ monthly_ontime }] = await db('attendance')
    .where('attendance_date', '>=', startOfMonth)
    .where('status', 'present')
    .count('* as monthly_ontime');

  const ontimeRate = parseInt(monthly_present) > 0
    ? Math.round((parseInt(monthly_ontime) / parseInt(monthly_present)) * 100)
    : 0;

  return {
    total_employees: parseInt(total_employees),
    today: {
      date: today,
      present: statsMap.present || 0,
      late: statsMap.late || 0,
      sick: statsMap.sick || 0,
      permit: statsMap.permit || 0,
      leave: statsMap.leave || 0,
      wfh: statsMap.wfh || 0,
      absent: Math.max(0, totalAbsent),
      total_checked_in: totalPresent,
    },
    pending_leaves: parseInt(pending_leaves),
    attendance_rate: Math.min(100, attendanceRate),
    ontime_rate: Math.min(100, ontimeRate),
  };
}

/**
 * Get attendance chart data (last 7 or 30 days)
 */
async function getAttendanceChart(days = 7) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }

  const records = await db('attendance')
    .whereIn('attendance_date', dates)
    .select('attendance_date', 'status')
    .count('* as count')
    .groupBy('attendance_date', 'status')
    .orderBy('attendance_date');

  const chartData = dates.map((date) => {
    const dayRecords = records.filter((r) => formatDate(r.attendance_date) === date);
    const result = { date };
    dayRecords.forEach((r) => { result[r.status] = parseInt(r.count); });
    return result;
  });

  return chartData;
}

/**
 * Get recent activities
 */
async function getRecentActivities(limit = 10) {
  const today = formatDate(new Date());

  // Recent check-ins
  const checkIns = await db('attendance')
    .join('employees', 'attendance.employee_id', 'employees.id')
    .select(
      db.raw("'check_in' as type"),
      'employees.full_name as user_name',
      'attendance.check_in_time as timestamp',
      'attendance.status'
    )
    .where('attendance.attendance_date', today)
    .whereNotNull('attendance.check_in_time')
    .orderBy('attendance.check_in_time', 'desc')
    .limit(limit);

  // Recent leave requests
  const leaveReqs = await db('leave_requests')
    .join('employees', 'leave_requests.employee_id', 'employees.id')
    .join('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
    .select(
      db.raw("'leave_request' as type"),
      'employees.full_name as user_name',
      'leave_requests.created_at as timestamp',
      'leave_requests.status',
      'leave_types.name as leave_type'
    )
    .orderBy('leave_requests.created_at', 'desc')
    .limit(5);

  const activities = [...checkIns, ...leaveReqs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);

  return activities;
}

/**
 * Helper: count work days in a range
 */
async function getWorkDaysInRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

module.exports = {
  getDashboardStats,
  getAttendanceChart,
  getRecentActivities,
};

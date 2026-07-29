const attendanceService = require('../services/attendanceService');
const response = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * POST /attendance/check-in
 */
async function checkIn(req, res, next) {
  try {
    const employeeId = req.user.employee ? req.user.employee.id : null;
    if (!employeeId) {
      return response.error(res, 'Hanya karyawan yang bisa melakukan check-in', 403);
    }

    const data = {
      ...req.body,
      userId: req.user.id,
    };

    const result = await attendanceService.checkIn(employeeId, data);
    return response.success(res, result, result.is_late ? 'Check-in berhasil (Terlambat)' : 'Check-in berhasil');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /attendance/check-out
 */
async function checkOut(req, res, next) {
  try {
    const employeeId = req.user.employee ? req.user.employee.id : null;
    if (!employeeId) {
      return response.error(res, 'Hanya karyawan yang bisa melakukan check-out', 403);
    }

    const data = {
      ...req.body,
      userId: req.user.id,
    };

    const result = await attendanceService.checkOut(employeeId, data);
    return response.success(res, result, `Check-out berhasil. Total jam kerja: ${result.work_hours} jam ${result.work_minutes} menit.`);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /attendance/today
 */
async function getToday(req, res, next) {
  try {
    const employeeId = req.user.employee ? req.user.employee.id : null;
    if (!employeeId) {
      return response.success(res, null);
    }

    const result = await attendanceService.getTodayAttendance(employeeId);
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /attendance/history
 */
async function getHistory(req, res, next) {
  try {
    const employeeId = req.user.employee ? req.user.employee.id : null;
    if (!employeeId) {
      return response.paginated(res, [], { page: 1, limit: 20, total: 0 });
    }

    const { page, limit } = parsePagination(req.query);
    const { startDate, endDate, status } = req.query;

    const result = await attendanceService.getHistory(employeeId, { page, limit, startDate, endDate, status });
    return response.paginated(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /attendance/all (HRD/Admin)
 */
async function getAll(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { date, departmentId, status } = req.query;

    const result = await attendanceService.getAllAttendance({ page, limit, date, departmentId, status });
    return response.paginated(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /attendance/team (Supervisor)
 */
async function getTeam(req, res, next) {
  try {
    const supervisorId = req.user.employee ? req.user.employee.id : null;
    if (!supervisorId) {
      return response.error(res, 'Akses ditolak', 403);
    }

    const { date } = req.query;
    const result = await attendanceService.getTeamAttendance(supervisorId, { date });
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /attendance/monthly-summary
 */
async function getMonthlySummary(req, res, next) {
  try {
    const employeeId = req.user.employee ? req.user.employee.id : null;
    if (!employeeId) {
      return response.success(res, null);
    }

    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || (new Date().getMonth() + 1);

    const result = await attendanceService.getMonthlySummary(employeeId, year, month);
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /attendance/monitor
 */
async function getMonitorData(req, res, next) {
  try {
    const { date } = req.query;
    const result = await attendanceService.getMonitorData(date);
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkIn,
  checkOut,
  getToday,
  getHistory,
  getAll,
  getTeam,
  getMonthlySummary,
  getMonitorData,
};

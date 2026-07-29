const dashboardService = require('../services/dashboardService');
const response = require('../utils/response');

/**
 * GET /dashboard/stats
 */
async function getStats(req, res, next) {
  try {
    const roleName = req.user.role_name || req.user.role;
    const result = await dashboardService.getDashboardStats(req.user.id, roleName);
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /dashboard/attendance-chart
 */
async function getAttendanceChart(req, res, next) {
  try {
    const days = parseInt(req.query.days) || 7;
    const result = await dashboardService.getAttendanceChart(days);
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /dashboard/recent-activities
 */
async function getRecentActivities(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await dashboardService.getRecentActivities(limit);
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
  getAttendanceChart,
  getRecentActivities,
};

const leaveService = require('../services/leaveService');
const response = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * POST /leaves
 */
async function createRequest(req, res, next) {
  try {
    const employeeId = req.user.employee ? req.user.employee.id : null;
    if (!employeeId) {
      return response.error(res, 'Hanya karyawan yang bisa mengajukan cuti', 403);
    }

    const result = await leaveService.createLeaveRequest(employeeId, req.body);
    return response.created(res, result, 'Pengajuan cuti berhasil dibuat');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /leaves/my-requests
 */
async function getMyRequests(req, res, next) {
  try {
    const employeeId = req.user.employee ? req.user.employee.id : null;
    if (!employeeId) {
      return response.paginated(res, [], { page: 1, limit: 20, total: 0 });
    }

    const { page, limit } = parsePagination(req.query);
    const { status, year } = req.query;

    const result = await leaveService.getMyLeaveRequests(employeeId, { page, limit, status, year });
    return response.paginated(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /leaves/approvals
 */
async function getApprovals(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await leaveService.getPendingApprovals(req.user.id, { page, limit });
    return response.paginated(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /leaves/:id/approve
 */
async function approve(req, res, next) {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const result = await leaveService.approveLeave(id, req.user.id, remarks);
    return response.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /leaves/:id/reject
 */
async function reject(req, res, next) {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const result = await leaveService.rejectLeave(id, req.user.id, remarks);
    return response.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /leaves/balances
 */
async function getBalances(req, res, next) {
  try {
    let { employeeId, year } = req.query;
    
    // If not admin/hrd and not asking for own balance
    if (!employeeId) {
        employeeId = req.user.employee ? req.user.employee.id : null;
    } else {
        // Need to verify permissions if asking for other's balance
        const isOwn = req.user.employee && req.user.employee.id === employeeId;
        const canReadAll = req.user.permissions && req.user.permissions.includes('LEAVE_READ_ALL');
        if (!isOwn && !canReadAll) {
            return response.error(res, 'Anda tidak memiliki akses ke saldo cuti ini', 403);
        }
    }

    if (!employeeId) {
      return response.success(res, []);
    }

    const result = await leaveService.getLeaveBalances(employeeId, year);
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /leaves/types
 */
async function getTypes(req, res, next) {
  try {
    const result = await leaveService.getLeaveTypes();
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /leaves/:id
 */
async function getDetail(req, res, next) {
  try {
    const { id } = req.params;
    const result = await leaveService.getLeaveDetail(id);
    
    // Authorization check
    const isOwn = req.user.employee && req.user.employee.id === result.employee_id;
    const isApprover = req.user.employee && result.current_approver_id === req.user.employee.id;
    const hasHistory = result.approvals.some(a => req.user.employee && a.approver_id === req.user.employee.id);
    const canReadAll = req.user.permissions && req.user.permissions.includes('LEAVE_READ_ALL');
    
    if (!isOwn && !isApprover && !hasHistory && !canReadAll) {
       return response.error(res, 'Akses ditolak', 403);
    }

    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}


module.exports = {
  createRequest,
  getMyRequests,
  getApprovals,
  approve,
  reject,
  getBalances,
  getTypes,
  getDetail,
};

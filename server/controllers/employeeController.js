const employeeService = require('../services/employeeService');
const response = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * GET /employees
 */
async function getAll(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { search, departmentId, status } = req.query;

    const result = await employeeService.getAllEmployees({ page, limit, search, departmentId, status });
    return response.paginated(res, result.data, result.meta);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /employees/:id
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await employeeService.getEmployeeById(id);
    return response.success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /employees
 */
async function create(req, res, next) {
  try {
    const result = await employeeService.createEmployee(req.body);
    return response.created(res, result, 'Data karyawan berhasil ditambahkan');
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /employees/:id
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const result = await employeeService.updateEmployee(id, req.body);
    return response.success(res, result, 'Data karyawan berhasil diperbarui');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /departments
 */
async function getDepartments(req, res, next) {
    try {
      const result = await employeeService.getDepartments();
      return response.success(res, result);
    } catch (error) {
      next(error);
    }
}

/**
 * GET /positions
 */
async function getPositions(req, res, next) {
    try {
      const result = await employeeService.getPositions();
      return response.success(res, result);
    } catch (error) {
      next(error);
    }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  getDepartments,
  getPositions
};

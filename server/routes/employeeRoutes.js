const express = require('express');
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createEmployeeSchema, updateEmployeeSchema } = require('../validators/employeeValidator');
const { PERMISSIONS } = require('@siati/shared');

const router = express.Router();

router.use(authenticate);

// Reference data
router.get('/departments', checkPermission(PERMISSIONS.EMPLOYEE_READ_ALL), employeeController.getDepartments);
router.get('/positions', checkPermission(PERMISSIONS.EMPLOYEE_READ_ALL), employeeController.getPositions);

// Employee CRUD
router.get('/', checkPermission(PERMISSIONS.EMPLOYEE_READ_ALL), employeeController.getAll);
router.post('/', checkPermission(PERMISSIONS.EMPLOYEE_CREATE), validate(createEmployeeSchema), employeeController.create);
router.get('/:id', checkPermission(PERMISSIONS.EMPLOYEE_READ_ALL), employeeController.getById);
router.put('/:id', checkPermission(PERMISSIONS.EMPLOYEE_UPDATE), validate(updateEmployeeSchema), employeeController.update);

module.exports = router;

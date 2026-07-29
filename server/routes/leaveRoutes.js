const express = require('express');
const leaveController = require('../controllers/leaveController');
const { authenticate } = require('../middleware/auth');
const { checkPermission, requireAnyPermission } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createLeaveSchema, approveLeaveSchema, rejectLeaveSchema } = require('../validators/leaveValidator');
const { PERMISSIONS } = require('@siati/shared');

const router = express.Router();

router.use(authenticate);

// Leave Types & Balances (Accessible to anyone with read own permission)
router.get('/types', checkPermission(PERMISSIONS.LEAVE_READ_OWN), leaveController.getTypes);
router.get('/balances', requireAnyPermission([PERMISSIONS.LEAVE_READ_OWN, PERMISSIONS.LEAVE_READ_ALL]), leaveController.getBalances);

// Requests
router.post('/', checkPermission(PERMISSIONS.LEAVE_REQUEST), validate(createLeaveSchema), leaveController.createRequest);
router.get('/my-requests', checkPermission(PERMISSIONS.LEAVE_READ_OWN), leaveController.getMyRequests);

// Approvals (Supervisor/HRD)
router.get('/approvals', requireAnyPermission([PERMISSIONS.LEAVE_APPROVE_TEAM, PERMISSIONS.LEAVE_APPROVE_ALL]), leaveController.getApprovals);
router.post('/:id/approve', requireAnyPermission([PERMISSIONS.LEAVE_APPROVE_TEAM, PERMISSIONS.LEAVE_APPROVE_ALL]), validate(approveLeaveSchema), leaveController.approve);
router.post('/:id/reject', requireAnyPermission([PERMISSIONS.LEAVE_APPROVE_TEAM, PERMISSIONS.LEAVE_APPROVE_ALL]), validate(rejectLeaveSchema), leaveController.reject);

// Detail
router.get('/:id', requireAnyPermission([PERMISSIONS.LEAVE_READ_OWN, PERMISSIONS.LEAVE_READ_TEAM, PERMISSIONS.LEAVE_READ_ALL]), leaveController.getDetail);

module.exports = router;

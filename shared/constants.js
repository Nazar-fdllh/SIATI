// Shared constants used by both client and server

const APP_NAME = 'SIATI';
const APP_FULL_NAME = 'Sistem Informasi Absensi dan Cuti Karyawan';

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HRD: 'hrd',
  SUPERVISOR: 'supervisor',
  KARYAWAN: 'karyawan',
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.HRD]: 'HRD',
  [ROLES.SUPERVISOR]: 'Supervisor',
  [ROLES.KARYAWAN]: 'Karyawan',
};

const PERMISSIONS = {
  // Attendance
  ATTENDANCE_CHECKIN: 'attendance:checkin',
  ATTENDANCE_CHECKOUT: 'attendance:checkout',
  ATTENDANCE_READ_OWN: 'attendance:read_own',
  ATTENDANCE_READ_TEAM: 'attendance:read_team',
  ATTENDANCE_READ_ALL: 'attendance:read_all',
  ATTENDANCE_EDIT: 'attendance:edit',

  // Leave
  LEAVE_REQUEST: 'leave:request',
  LEAVE_READ_OWN: 'leave:read_own',
  LEAVE_READ_TEAM: 'leave:read_team',
  LEAVE_READ_ALL: 'leave:read_all',
  LEAVE_APPROVE_TEAM: 'leave:approve_team',
  LEAVE_APPROVE_ALL: 'leave:approve_all',
  LEAVE_MANAGE_TYPES: 'leave:manage_types',
  LEAVE_MANAGE_BALANCE: 'leave:manage_balance',

  // Employee
  EMPLOYEE_READ_OWN: 'employee:read_own',
  EMPLOYEE_READ_TEAM: 'employee:read_team',
  EMPLOYEE_READ_ALL: 'employee:read_all',
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_UPDATE: 'employee:update',
  EMPLOYEE_DELETE: 'employee:delete',

  // Report
  REPORT_READ_OWN: 'report:read_own',
  REPORT_READ_TEAM: 'report:read_team',
  REPORT_READ_ALL: 'report:read_all',
  REPORT_EXPORT: 'report:export',

  // System
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_AUDIT: 'system:audit',
  SYSTEM_ROLE_MANAGE: 'system:role_manage',
  SYSTEM_HOLIDAY_MANAGE: 'system:holiday_manage',
  SYSTEM_SHIFT_MANAGE: 'system:shift_manage',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  APP_NAME,
  APP_FULL_NAME,
  ROLES,
  ROLE_LABELS,
  PERMISSIONS,
  PAGINATION,
};

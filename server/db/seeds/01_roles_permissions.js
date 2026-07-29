const bcrypt = require('bcryptjs');
const { PERMISSIONS } = require('@siati/shared');

/**
 * Seed: Roles, Permissions, Role-Permission mappings, and default admin user
 */
exports.seed = async function (knex) {
  // Clean tables in order
  await knex('role_permissions').del();
  await knex('permissions').del();
  await knex('roles').del();

  // ========== ROLES ==========
  const [superAdmin] = await knex('roles').insert({ name: 'super_admin', description: 'Akses penuh ke seluruh sistem', is_system: true }).returning('id');
  const [hrd] = await knex('roles').insert({ name: 'hrd', description: 'Human Resources Department', is_system: true }).returning('id');
  const [supervisor] = await knex('roles').insert({ name: 'supervisor', description: 'Supervisor / Manajer Tim', is_system: true }).returning('id');
  const [karyawan] = await knex('roles').insert({ name: 'karyawan', description: 'Karyawan Reguler', is_system: true }).returning('id');

  // ========== PERMISSIONS ==========
  const allPermissions = [
    // Attendance
    { code: PERMISSIONS.ATTENDANCE_CHECKIN, name: 'Check-in Absensi', module: 'attendance' },
    { code: PERMISSIONS.ATTENDANCE_CHECKOUT, name: 'Check-out Absensi', module: 'attendance' },
    { code: PERMISSIONS.ATTENDANCE_READ_OWN, name: 'Lihat Absensi Sendiri', module: 'attendance' },
    { code: PERMISSIONS.ATTENDANCE_READ_TEAM, name: 'Lihat Absensi Tim', module: 'attendance' },
    { code: PERMISSIONS.ATTENDANCE_READ_ALL, name: 'Lihat Semua Absensi', module: 'attendance' },
    { code: PERMISSIONS.ATTENDANCE_EDIT, name: 'Edit/Koreksi Absensi', module: 'attendance' },
    // Leave
    { code: PERMISSIONS.LEAVE_REQUEST, name: 'Ajukan Cuti', module: 'leave' },
    { code: PERMISSIONS.LEAVE_READ_OWN, name: 'Lihat Cuti Sendiri', module: 'leave' },
    { code: PERMISSIONS.LEAVE_READ_TEAM, name: 'Lihat Cuti Tim', module: 'leave' },
    { code: PERMISSIONS.LEAVE_READ_ALL, name: 'Lihat Semua Cuti', module: 'leave' },
    { code: PERMISSIONS.LEAVE_APPROVE_TEAM, name: 'Approval Cuti Tim', module: 'leave' },
    { code: PERMISSIONS.LEAVE_APPROVE_ALL, name: 'Approval Semua Cuti', module: 'leave' },
    { code: PERMISSIONS.LEAVE_MANAGE_TYPES, name: 'Kelola Tipe Cuti', module: 'leave' },
    { code: PERMISSIONS.LEAVE_MANAGE_BALANCE, name: 'Kelola Saldo Cuti', module: 'leave' },
    // Employee
    { code: PERMISSIONS.EMPLOYEE_READ_OWN, name: 'Lihat Profil Sendiri', module: 'employee' },
    { code: PERMISSIONS.EMPLOYEE_READ_TEAM, name: 'Lihat Karyawan Tim', module: 'employee' },
    { code: PERMISSIONS.EMPLOYEE_READ_ALL, name: 'Lihat Semua Karyawan', module: 'employee' },
    { code: PERMISSIONS.EMPLOYEE_CREATE, name: 'Tambah Karyawan', module: 'employee' },
    { code: PERMISSIONS.EMPLOYEE_UPDATE, name: 'Edit Karyawan', module: 'employee' },
    { code: PERMISSIONS.EMPLOYEE_DELETE, name: 'Hapus Karyawan', module: 'employee' },
    // Report
    { code: PERMISSIONS.REPORT_READ_OWN, name: 'Laporan Pribadi', module: 'report' },
    { code: PERMISSIONS.REPORT_READ_TEAM, name: 'Laporan Tim', module: 'report' },
    { code: PERMISSIONS.REPORT_READ_ALL, name: 'Semua Laporan', module: 'report' },
    { code: PERMISSIONS.REPORT_EXPORT, name: 'Export Laporan', module: 'report' },
    // System
    { code: PERMISSIONS.SYSTEM_CONFIG, name: 'Konfigurasi Sistem', module: 'system' },
    { code: PERMISSIONS.SYSTEM_AUDIT, name: 'Audit Log', module: 'system' },
    { code: PERMISSIONS.SYSTEM_ROLE_MANAGE, name: 'Kelola Role & Permission', module: 'system' },
    { code: PERMISSIONS.SYSTEM_HOLIDAY_MANAGE, name: 'Kelola Hari Libur', module: 'system' },
    { code: PERMISSIONS.SYSTEM_SHIFT_MANAGE, name: 'Kelola Shift', module: 'system' },
  ];

  const insertedPermissions = await knex('permissions').insert(allPermissions).returning(['id', 'code']);
  const permMap = {};
  insertedPermissions.forEach((p) => { permMap[p.code] = p.id; });

  // ========== ROLE-PERMISSION MAPPINGS ==========
  const allPermCodes = Object.values(PERMISSIONS);

  // Super Admin gets ALL permissions
  const adminPerms = allPermCodes.map((code) => ({
    role_id: superAdmin.id,
    permission_id: permMap[code],
  }));

  // HRD permissions
  const hrdPermCodes = [
    PERMISSIONS.ATTENDANCE_CHECKIN, PERMISSIONS.ATTENDANCE_CHECKOUT,
    PERMISSIONS.ATTENDANCE_READ_OWN, PERMISSIONS.ATTENDANCE_READ_ALL, PERMISSIONS.ATTENDANCE_EDIT,
    PERMISSIONS.LEAVE_REQUEST, PERMISSIONS.LEAVE_READ_OWN, PERMISSIONS.LEAVE_READ_ALL,
    PERMISSIONS.LEAVE_APPROVE_ALL, PERMISSIONS.LEAVE_MANAGE_TYPES, PERMISSIONS.LEAVE_MANAGE_BALANCE,
    PERMISSIONS.EMPLOYEE_READ_OWN, PERMISSIONS.EMPLOYEE_READ_ALL,
    PERMISSIONS.EMPLOYEE_CREATE, PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.REPORT_READ_OWN, PERMISSIONS.REPORT_READ_ALL, PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.SYSTEM_HOLIDAY_MANAGE, PERMISSIONS.SYSTEM_SHIFT_MANAGE,
  ];
  const hrdPerms = hrdPermCodes.map((code) => ({
    role_id: hrd.id,
    permission_id: permMap[code],
  }));

  // Supervisor permissions
  const supPermCodes = [
    PERMISSIONS.ATTENDANCE_CHECKIN, PERMISSIONS.ATTENDANCE_CHECKOUT,
    PERMISSIONS.ATTENDANCE_READ_OWN, PERMISSIONS.ATTENDANCE_READ_TEAM,
    PERMISSIONS.LEAVE_REQUEST, PERMISSIONS.LEAVE_READ_OWN, PERMISSIONS.LEAVE_READ_TEAM,
    PERMISSIONS.LEAVE_APPROVE_TEAM,
    PERMISSIONS.EMPLOYEE_READ_OWN, PERMISSIONS.EMPLOYEE_READ_TEAM,
    PERMISSIONS.REPORT_READ_OWN, PERMISSIONS.REPORT_READ_TEAM, PERMISSIONS.REPORT_EXPORT,
  ];
  const supPerms = supPermCodes.map((code) => ({
    role_id: supervisor.id,
    permission_id: permMap[code],
  }));

  // Karyawan permissions
  const empPermCodes = [
    PERMISSIONS.ATTENDANCE_CHECKIN, PERMISSIONS.ATTENDANCE_CHECKOUT,
    PERMISSIONS.ATTENDANCE_READ_OWN,
    PERMISSIONS.LEAVE_REQUEST, PERMISSIONS.LEAVE_READ_OWN,
    PERMISSIONS.EMPLOYEE_READ_OWN,
    PERMISSIONS.REPORT_READ_OWN,
  ];
  const empPerms = empPermCodes.map((code) => ({
    role_id: karyawan.id,
    permission_id: permMap[code],
  }));

  await knex('role_permissions').insert([...adminPerms, ...hrdPerms, ...supPerms, ...empPerms]);

  console.log('✅ Roles & Permissions seeded');
};

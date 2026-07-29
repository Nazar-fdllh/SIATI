/**
 * Seed: Leave types, shifts, system config, and default admin user
 */
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // ========== LEAVE TYPES ==========
  await knex('leave_types').del();
  await knex('leave_types').insert([
    { name: 'Cuti Tahunan', code: 'CT', default_balance: 12, is_paid: true, requires_document: false, description: 'Cuti tahunan karyawan' },
    { name: 'Cuti Sakit', code: 'CS', default_balance: 14, is_paid: true, requires_document: true, description: 'Cuti karena sakit (wajib surat dokter)' },
    { name: 'Cuti Melahirkan', code: 'CM', default_balance: 90, is_paid: true, requires_document: true, description: 'Cuti melahirkan' },
    { name: 'Cuti Menikah', code: 'CN', default_balance: 3, is_paid: true, requires_document: true, description: 'Cuti pernikahan karyawan' },
    { name: 'Cuti Kematian Keluarga', code: 'CK', default_balance: 3, is_paid: true, requires_document: true, description: 'Cuti karena kematian keluarga inti' },
    { name: 'Cuti Khitan/Baptis', code: 'CB', default_balance: 2, is_paid: true, requires_document: false, description: 'Cuti khitan atau baptis anak' },
    { name: 'Izin Tidak Masuk', code: 'IT', default_balance: 6, is_paid: false, requires_document: false, description: 'Izin tidak masuk kerja' },
    { name: 'Cuti Tanpa Gaji', code: 'CTG', default_balance: 30, is_paid: false, requires_document: true, description: 'Cuti tanpa bayaran' },
  ]);

  // ========== SHIFTS ==========
  await knex('shifts').del();
  await knex('shifts').insert([
    { name: 'Regular', start_time: '09:00', end_time: '18:00', tolerance_minutes: 15, break_duration_minutes: 60 },
    { name: 'Shift Pagi', start_time: '07:00', end_time: '15:00', tolerance_minutes: 15, break_duration_minutes: 60 },
    { name: 'Shift Siang', start_time: '14:00', end_time: '22:00', tolerance_minutes: 15, break_duration_minutes: 60 },
    { name: 'Shift Malam', start_time: '22:00', end_time: '06:00', tolerance_minutes: 15, break_duration_minutes: 60 },
  ]);

  // ========== DEPARTMENTS ==========
  await knex('departments').del();
  await knex('departments').insert([
    { name: 'Human Resources', code: 'HR', description: 'Departemen SDM' },
    { name: 'IT & Development', code: 'IT', description: 'Departemen Teknologi Informasi' },
    { name: 'Finance', code: 'FIN', description: 'Departemen Keuangan' },
    { name: 'Marketing', code: 'MKT', description: 'Departemen Pemasaran' },
    { name: 'Operations', code: 'OPS', description: 'Departemen Operasional' },
  ]);

  // ========== POSITIONS ==========
  await knex('positions').del();
  await knex('positions').insert([
    { name: 'Staff', level: 'staff', description: 'Staff reguler' },
    { name: 'Senior Staff', level: 'senior', description: 'Staff senior' },
    { name: 'Team Lead', level: 'lead', description: 'Ketua tim' },
    { name: 'Manager', level: 'manager', description: 'Manajer departemen' },
    { name: 'Director', level: 'director', description: 'Direktur' },
  ]);

  // ========== SYSTEM CONFIG ==========
  await knex('system_config').del();
  await knex('system_config').insert([
    { key: 'office_latitude', value: '-6.200000', description: 'Koordinat latitude kantor' },
    { key: 'office_longitude', value: '106.816666', description: 'Koordinat longitude kantor' },
    { key: 'geofence_radius_meters', value: '200', description: 'Radius valid absensi (meter)' },
    { key: 'max_photo_size_mb', value: '5', description: 'Ukuran max foto absensi (MB)' },
    { key: 'auto_checkout_time', value: '23:59', description: 'Waktu auto checkout' },
    { key: 'allowed_ip_ranges', value: '["0.0.0.0/0"]', description: 'Range IP yang diizinkan' },
    { key: 'leave_carry_over_max', value: '5', description: 'Maksimal hari carry over cuti' },
    { key: 'leave_carry_over_expiry_months', value: '3', description: 'Bulan expired carry over' },
    { key: 'company_name', value: 'PT. Nama Perusahaan', description: 'Nama perusahaan' },
  ]);

  // ========== DEFAULT ADMIN USER ==========
  // Check if admin user exists
  const existingAdmin = await knex('users').where('email', 'admin@siati.com').first();
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('Admin@123', salt);

    const adminRole = await knex('roles').where('name', 'super_admin').first();
    const dept = await knex('departments').where('code', 'IT').first();
    const position = await knex('positions').where('name', 'Director').first();
    const shift = await knex('shifts').where('name', 'Regular').first();

    const [user] = await knex('users').insert({
      email: 'admin@siati.com',
      password_hash: hash,
      role_id: adminRole.id,
      is_active: true,
    }).returning('id');

    await knex('employees').insert({
      user_id: user.id,
      employee_code: 'ADM-001',
      full_name: 'Super Administrator',
      nickname: 'Admin',
      phone: '081234567890',
      department_id: dept.id,
      position_id: position.id,
      shift_id: shift.id,
      employment_status: 'active',
      join_date: '2024-01-01',
    });

    console.log('✅ Default admin user created: admin@siati.com / Admin@123');
  }

  console.log('✅ Master data seeded');
};

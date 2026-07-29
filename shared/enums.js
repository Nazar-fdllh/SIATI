// Shared enums matching PostgreSQL ENUM types

const EMPLOYMENT_STATUS = {
  ACTIVE: 'active',
  PROBATION: 'probation',
  CONTRACT: 'contract',
  RESIGNED: 'resigned',
  TERMINATED: 'terminated',
};

const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  SICK: 'sick',
  PERMIT: 'permit',
  LEAVE: 'leave',
  WFH: 'wfh',
  BUSINESS_TRIP: 'business_trip',
  ABSENT: 'absent',
};

const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: 'Hadir',
  [ATTENDANCE_STATUS.LATE]: 'Terlambat',
  [ATTENDANCE_STATUS.SICK]: 'Sakit',
  [ATTENDANCE_STATUS.PERMIT]: 'Izin',
  [ATTENDANCE_STATUS.LEAVE]: 'Cuti',
  [ATTENDANCE_STATUS.WFH]: 'WFH',
  [ATTENDANCE_STATUS.BUSINESS_TRIP]: 'Dinas Luar',
  [ATTENDANCE_STATUS.ABSENT]: 'Tidak Hadir',
};

const LEAVE_REQUEST_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED_L1: 'approved_l1',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

const LEAVE_STATUS_LABELS = {
  [LEAVE_REQUEST_STATUS.DRAFT]: 'Draft',
  [LEAVE_REQUEST_STATUS.PENDING]: 'Menunggu Persetujuan',
  [LEAVE_REQUEST_STATUS.APPROVED_L1]: 'Disetujui Supervisor',
  [LEAVE_REQUEST_STATUS.APPROVED]: 'Disetujui',
  [LEAVE_REQUEST_STATUS.REJECTED]: 'Ditolak',
  [LEAVE_REQUEST_STATUS.CANCELLED]: 'Dibatalkan',
};

const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const NOTIFICATION_TYPE = {
  ATTENDANCE: 'attendance',
  LEAVE_REQUEST: 'leave_request',
  LEAVE_APPROVAL: 'leave_approval',
  SYSTEM: 'system',
  REMINDER: 'reminder',
};

const HOLIDAY_TYPE = {
  NATIONAL: 'national',
  COMPANY: 'company',
  COLLECTIVE_LEAVE: 'collective_leave',
};

const URGENCY = {
  NORMAL: 'normal',
  URGENT: 'urgent',
};

module.exports = {
  EMPLOYMENT_STATUS,
  GENDER,
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABELS,
  LEAVE_REQUEST_STATUS,
  LEAVE_STATUS_LABELS,
  APPROVAL_STATUS,
  NOTIFICATION_TYPE,
  HOLIDAY_TYPE,
  URGENCY,
};

// Shared validation rules (used in both frontend and backend)

const VALIDATION = {
  EMAIL: {
    MIN: 5,
    MAX: 100,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN: 8,
    MAX: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
    MESSAGE: 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
  },
  NAME: {
    MIN: 2,
    MAX: 100,
  },
  PHONE: {
    MIN: 10,
    MAX: 15,
    PATTERN: /^(\+62|62|0)8[1-9][0-9]{6,11}$/,
  },
  EMPLOYEE_CODE: {
    PATTERN: /^[A-Z]{2,4}-\d{3,6}$/,
    MESSAGE: 'Format kode karyawan: XX-000 (contoh: EMP-001)',
  },
  LEAVE_REASON: {
    MIN: 10,
    MAX: 500,
  },
  FILE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOC_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  },
};

module.exports = { VALIDATION };

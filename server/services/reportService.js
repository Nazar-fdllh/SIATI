const { db } = require('../config/database');
const excel = require('exceljs');
const PdfPrinter = require('pdfmake');
const { formatDate } = require('@siati/shared');
const path = require('path');

// Default fonts for pdfmake
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};
const printer = new PdfPrinter(fonts);

/**
 * Generate Attendance Excel Report
 */
async function generateAttendanceExcel(startDate, endDate, departmentId) {
  let query = db('attendance')
    .join('employees', 'attendance.employee_id', 'employees.id')
    .leftJoin('departments', 'employees.department_id', 'departments.id')
    .select(
      'attendance.attendance_date',
      'attendance.check_in_time',
      'attendance.check_out_time',
      'attendance.status',
      'attendance.work_duration_minutes',
      'attendance.notes',
      'employees.full_name',
      'employees.employee_code',
      'departments.name as department_name'
    )
    .whereBetween('attendance.attendance_date', [startDate, endDate])
    .orderBy('attendance.attendance_date', 'asc')
    .orderBy('employees.full_name', 'asc');

  if (departmentId) {
    query = query.where('employees.department_id', departmentId);
  }

  const data = await query;

  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet('Laporan Absensi');

  worksheet.columns = [
    { header: 'Tanggal', key: 'date', width: 15 },
    { header: 'NIK', key: 'nik', width: 15 },
    { header: 'Nama Karyawan', key: 'name', width: 25 },
    { header: 'Departemen', key: 'dept', width: 20 },
    { header: 'Check-In', key: 'checkIn', width: 20 },
    { header: 'Check-Out', key: 'checkOut', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Durasi Kerja (Menit)', key: 'duration', width: 20 },
    { header: 'Catatan', key: 'notes', width: 30 },
  ];

  // Styling header
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

  data.forEach((row) => {
    worksheet.addRow({
      date: formatDate(row.attendance_date),
      nik: row.employee_code,
      name: row.full_name,
      dept: row.department_name || '-',
      checkIn: row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString('id-ID') : '-',
      checkOut: row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString('id-ID') : '-',
      status: row.status.toUpperCase(),
      duration: row.work_duration_minutes,
      notes: row.notes || '-',
    });
  });

  return workbook.xlsx.writeBuffer();
}

/**
 * Generate Attendance PDF Report
 */
async function generateAttendancePDF(startDate, endDate, departmentId) {
  let query = db('attendance')
    .join('employees', 'attendance.employee_id', 'employees.id')
    .select(
      'attendance.attendance_date',
      'attendance.check_in_time',
      'attendance.status',
      'employees.full_name'
    )
    .whereBetween('attendance.attendance_date', [startDate, endDate])
    .orderBy('attendance.attendance_date', 'asc');

  if (departmentId) query = query.where('employees.department_id', departmentId);

  const data = await query;

  const tableBody = [
    [
      { text: 'Tanggal', style: 'tableHeader' },
      { text: 'Nama Karyawan', style: 'tableHeader' },
      { text: 'Check-In', style: 'tableHeader' },
      { text: 'Status', style: 'tableHeader' }
    ]
  ];

  data.forEach(row => {
    tableBody.push([
      formatDate(row.attendance_date),
      row.full_name,
      row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString('id-ID') : '-',
      row.status.toUpperCase()
    ]);
  });

  const docDefinition = {
    content: [
      { text: 'Laporan Absensi Karyawan', style: 'header' },
      { text: `Periode: ${startDate} s/d ${endDate}`, style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: tableBody
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 14, margin: [0, 0, 0, 20] },
      tableHeader: { bold: true, fontSize: 12, color: 'black' }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  
  return new Promise((resolve, reject) => {
    const chunks = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', err => reject(err));
    pdfDoc.end();
  });
}

/**
 * Generate Leave Excel Report
 */
async function generateLeaveExcel(startDate, endDate) {
  const data = await db('leave_requests')
    .join('employees', 'leave_requests.employee_id', 'employees.id')
    .join('leave_types', 'leave_requests.leave_type_id', 'leave_types.id')
    .select(
      'leave_requests.start_date',
      'leave_requests.end_date',
      'leave_requests.total_days',
      'leave_requests.status',
      'leave_requests.reason',
      'employees.full_name',
      'employees.employee_code',
      'leave_types.name as leave_type_name'
    )
    .where('leave_requests.status', 'approved')
    .where(function() {
      this.whereBetween('leave_requests.start_date', [startDate, endDate])
        .orWhereBetween('leave_requests.end_date', [startDate, endDate]);
    })
    .orderBy('leave_requests.start_date', 'asc');

  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet('Laporan Cuti');

  worksheet.columns = [
    { header: 'NIK', key: 'nik', width: 15 },
    { header: 'Nama Karyawan', key: 'name', width: 25 },
    { header: 'Tipe Cuti', key: 'type', width: 20 },
    { header: 'Tanggal Mulai', key: 'start', width: 15 },
    { header: 'Tanggal Selesai', key: 'end', width: 15 },
    { header: 'Total Hari', key: 'days', width: 15 },
    { header: 'Alasan', key: 'reason', width: 35 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

  data.forEach((row) => {
    worksheet.addRow({
      nik: row.employee_code,
      name: row.full_name,
      type: row.leave_type_name,
      start: formatDate(row.start_date),
      end: formatDate(row.end_date),
      days: row.total_days,
      reason: row.reason,
    });
  });

  return workbook.xlsx.writeBuffer();
}

module.exports = {
  generateAttendanceExcel,
  generateAttendancePDF,
  generateLeaveExcel,
};

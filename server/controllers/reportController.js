const reportService = require('../services/reportService');
const { AppError } = require('../middleware/errorHandler');
const { format } = require('date-fns');

/**
 * Export Attendance to Excel
 */
async function exportAttendanceExcel(req, res, next) {
  try {
    const { startDate, endDate, departmentId } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError('startDate dan endDate diperlukan', 400);
    }

    const buffer = await reportService.generateAttendanceExcel(startDate, endDate, departmentId);

    const fileName = `Laporan_Absensi_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
}

/**
 * Export Attendance to PDF
 */
async function exportAttendancePDF(req, res, next) {
  try {
    const { startDate, endDate, departmentId } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError('startDate dan endDate diperlukan', 400);
    }

    const buffer = await reportService.generateAttendancePDF(startDate, endDate, departmentId);

    const fileName = `Laporan_Absensi_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
}

/**
 * Export Leave to Excel
 */
async function exportLeaveExcel(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError('startDate dan endDate diperlukan', 400);
    }

    const buffer = await reportService.generateLeaveExcel(startDate, endDate);

    const fileName = `Laporan_Cuti_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  exportAttendanceExcel,
  exportAttendancePDF,
  exportLeaveExcel,
};

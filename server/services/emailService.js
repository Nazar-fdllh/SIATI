const transporter = require('../config/email');

/**
 * Send an email using the configured transporter
 */
async function sendEmail({ to, subject, html }) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP credentials not set, skipping email to:', to);
      return false;
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"SIATI HR" <no-reply@siati.com>',
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Template for leave request notification (to approver)
 */
async function sendLeaveRequestNotification(approverEmail, employeeName, leaveType, startDate, endDate, totalDays) {
  const subject = `Pemberitahuan: Pengajuan Cuti Baru - ${employeeName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Pengajuan Cuti Baru</h2>
      <p>Halo,</p>
      <p>Terdapat pengajuan cuti baru yang membutuhkan persetujuan Anda dengan detail sebagai berikut:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; width: 30%;"><strong>Nama Karyawan</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${employeeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tipe Cuti</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${leaveType}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tanggal</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${startDate} s/d ${endDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Durasi</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${totalDays} Hari</td>
        </tr>
      </table>
      <p>Silakan login ke sistem SIATI untuk melihat detail dan memberikan persetujuan (Approve/Reject).</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/leave/approval" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ke Halaman Persetujuan</a>
      </div>
      <p style="margin-top: 30px; font-size: 0.8em; color: #888;">Email ini dikirim otomatis oleh sistem SIATI. Mohon tidak membalas email ini.</p>
    </div>
  `;

  return sendEmail({ to: approverEmail, subject, html });
}

/**
 * Template for leave status update (to employee)
 */
async function sendLeaveStatusUpdate(employeeEmail, employeeName, leaveType, startDate, endDate, status, remarks) {
  const isApproved = status === 'approved';
  const statusColor = isApproved ? '#22C55E' : '#EF4444';
  const statusText = isApproved ? 'DISETUJUI' : 'DITOLAK';
  
  const subject = `Status Pengajuan Cuti: ${statusText}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusColor};">Pengajuan Cuti ${statusText}</h2>
      <p>Halo ${employeeName},</p>
      <p>Pengajuan cuti Anda telah <strong>${statusText.toLowerCase()}</strong> dengan detail sebagai berikut:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; width: 30%;"><strong>Tipe Cuti</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${leaveType}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tanggal</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${startDate} s/d ${endDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Catatan</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${remarks || '-'}</td>
        </tr>
      </table>
      <p>Silakan cek saldo dan riwayat cuti Anda di sistem SIATI.</p>
      <p style="margin-top: 30px; font-size: 0.8em; color: #888;">Email ini dikirim otomatis oleh sistem SIATI. Mohon tidak membalas email ini.</p>
    </div>
  `;

  return sendEmail({ to: employeeEmail, subject, html });
}

module.exports = {
  sendEmail,
  sendLeaveRequestNotification,
  sendLeaveStatusUpdate,
};

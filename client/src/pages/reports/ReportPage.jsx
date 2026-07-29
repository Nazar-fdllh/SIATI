import { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, MenuItem } from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { reportApi } from '../../../api/settingsApi';
import { useSnackbar } from 'notistack';

export default function ReportPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0],
    departmentId: '',
    reportType: 'attendance' // 'attendance' or 'leave'
  });
  const [downloading, setDownloading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      const params = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        ...(formData.departmentId && { departmentId: formData.departmentId })
      };

      let response;
      let filename = `Laporan_${formData.reportType}_${formData.startDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

      if (formData.reportType === 'attendance') {
        response = format === 'pdf' 
          ? await reportApi.downloadAttendancePDF(params) 
          : await reportApi.downloadAttendanceExcel(params);
      } else {
        if (format === 'pdf') {
          enqueueSnackbar('Export PDF untuk cuti belum didukung', { variant: 'info' });
          setDownloading(false);
          return;
        }
        response = await reportApi.downloadLeaveExcel(params);
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      enqueueSnackbar('Laporan berhasil diunduh', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal mengunduh laporan', { variant: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Generate Laporan</Typography>

      <Card sx={{ maxWidth: 800 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Jenis Laporan" name="reportType"
                value={formData.reportType} onChange={handleChange}
              >
                <MenuItem value="attendance">Laporan Kehadiran Karyawan</MenuItem>
                <MenuItem value="leave">Rekapitulasi Cuti Karyawan</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* Optional: Add department dropdown if API implemented to fetch departments */}
              <TextField
                fullWidth label="Departemen (Opsional)" name="departmentId"
                placeholder="ID Departemen"
                value={formData.departmentId} onChange={handleChange}
                helperText="Biarkan kosong untuk semua departemen"
                disabled // Disabled for MVP since we didn't hook up the API for it here yet
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="date" label="Dari Tanggal" name="startDate"
                value={formData.startDate} onChange={handleChange}
                InputLabelProps={{ shrink: true }} required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="date" label="Sampai Tanggal" name="endDate"
                value={formData.endDate} onChange={handleChange}
                InputLabelProps={{ shrink: true }} required
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload('excel')}
                disabled={downloading}
                size="large"
              >
                Download Excel
              </Button>
              {formData.reportType === 'attendance' && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<PdfIcon />}
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading}
                  size="large"
                >
                  Download PDF
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

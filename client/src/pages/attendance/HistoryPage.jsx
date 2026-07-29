import { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination
} from '@mui/material';
import { attendanceApi } from '../../../api/attendanceApi';

export default function HistoryPage() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory(meta.page);
  }, [meta.page]);

  const fetchHistory = async (page) => {
    setLoading(true);
    try {
      const res = await attendanceApi.getHistory({ page, limit: 10 });
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      case 'leave': case 'sick': case 'permit': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      present: 'Hadir', late: 'Terlambat', absent: 'Alpa',
      leave: 'Cuti', sick: 'Sakit', permit: 'Izin', wfh: 'WFH'
    };
    return labels[status] || status;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Riwayat Absensi</Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tanggal</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Lokasi Valid</TableCell>
                <TableCell>Durasi Kerja</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">Belum ada riwayat absensi</TableCell></TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {new Date(row.attendance_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>{row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                    <TableCell>{row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={getStatusLabel(row.status)} color={getStatusColor(row.status)} />
                    </TableCell>
                    <TableCell>{row.is_valid_location ? 'Ya' : 'Tidak'}</TableCell>
                    <TableCell>{row.work_duration_minutes ? `${Math.floor(row.work_duration_minutes / 60)}j ${row.work_duration_minutes % 60}m` : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {meta.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              count={meta.totalPages} 
              page={meta.page} 
              onChange={(e, p) => setMeta(prev => ({ ...prev, page: p }))} 
              color="primary" 
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}

import { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField
} from '@mui/material';
import { attendanceApi } from '../../../api/attendanceApi';

export default function MonitorPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        attendanceApi.getMonitor({ date }),
        attendanceApi.getAll({ date, limit: 100 }) // Fetching 100 for MVP monitor
      ]);
      setStats(statsRes.data);
      setList(listRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Monitor Absensi</Typography>
        <TextField
          type="date"
          size="small"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Box>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'info.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Total Karyawan</Typography>
                <Typography variant="h4">{stats.total_employees}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'success.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Sudah Check-In</Typography>
                <Typography variant="h4">{stats.checked_in}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'warning.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Terlambat</Typography>
                <Typography variant="h4">{stats.late}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'error.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Belum Check-In</Typography>
                <Typography variant="h4">{stats.not_checked_in}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Karyawan</TableCell>
                <TableCell>Departemen</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
              ) : list.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">Tidak ada data untuk tanggal ini</TableCell></TableRow>
              ) : (
                list.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Typography variant="body2">{row.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.employee_code}</Typography>
                    </TableCell>
                    <TableCell>{row.department_name}</TableCell>
                    <TableCell>{row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                    <TableCell>{row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={row.status === 'present' ? 'Hadir' : row.status === 'late' ? 'Terlambat' : row.status} 
                        color={row.status === 'present' ? 'success' : row.status === 'late' ? 'warning' : 'default'} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

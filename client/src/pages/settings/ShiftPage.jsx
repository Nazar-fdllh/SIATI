import { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { settingsApi } from '../../../api/settingsApi';

export default function ShiftPage() {
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await settingsApi.getShifts();
      setShifts(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Kelola Jam Kerja (Shift)</Typography>
        <Typography color="text.secondary">Shift yang terdaftar digunakan untuk menentukan toleransi keterlambatan karyawan.</Typography>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nama Shift</TableCell>
                <TableCell>Jam Masuk</TableCell>
                <TableCell>Jam Keluar</TableCell>
                <TableCell>Toleransi Telat (Menit)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Tidak ada data shift</TableCell>
                </TableRow>
              ) : (
                shifts.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                    <TableCell>{row.start_time}</TableCell>
                    <TableCell>{row.end_time}</TableCell>
                    <TableCell>{row.tolerance_minutes}</TableCell>
                    <TableCell>
                      <Chip label={row.is_active ? 'Aktif' : 'Nonaktif'} color={row.is_active ? 'success' : 'default'} size="small" />
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

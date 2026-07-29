import { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Checkbox, FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { settingsApi } from '../../../api/settingsApi';
import { useSnackbar } from 'notistack';

export default function HolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    holiday_date: '',
    type: 'national',
    is_recurring: false,
    description: ''
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await settingsApi.getHolidays();
      setHolidays(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsApi.createHoliday(formData);
      enqueueSnackbar('Hari libur berhasil ditambahkan', { variant: 'success' });
      setOpen(false);
      fetchHolidays();
      setFormData({ name: '', holiday_date: '', type: 'national', is_recurring: false, description: '' });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Gagal menambahkan hari libur', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus hari libur ini?')) return;
    try {
      await settingsApi.deleteHoliday(id);
      enqueueSnackbar('Hari libur dihapus', { variant: 'success' });
      fetchHolidays();
    } catch (error) {
      enqueueSnackbar('Gagal menghapus', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Kelola Hari Libur</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Tambah Hari Libur
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tanggal</TableCell>
                <TableCell>Nama Hari Libur</TableCell>
                <TableCell>Tipe</TableCell>
                <TableCell>Berulang?</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Tidak ada data hari libur</TableCell>
                </TableRow>
              ) : (
                holidays.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.holiday_date).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.type.toUpperCase()}</TableCell>
                    <TableCell>{row.is_recurring ? 'Ya' : 'Tidak'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleDelete(row.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Tambah Hari Libur</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField 
                label="Nama Hari Libur" required fullWidth
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <TextField 
                label="Tanggal" type="date" required fullWidth InputLabelProps={{ shrink: true }}
                value={formData.holiday_date} onChange={(e) => setFormData({...formData, holiday_date: e.target.value})}
              />
              <TextField 
                label="Tipe" select required fullWidth
                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <MenuItem value="national">Libur Nasional</MenuItem>
                <MenuItem value="company">Libur Perusahaan</MenuItem>
                <MenuItem value="collective_leave">Cuti Bersama</MenuItem>
              </TextField>
              <TextField 
                label="Deskripsi" multiline rows={2} fullWidth
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={formData.is_recurring} 
                    onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})} 
                  />
                } 
                label="Berulang Setiap Tahun" 
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" variant="contained" disabled={loading}>Simpan</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

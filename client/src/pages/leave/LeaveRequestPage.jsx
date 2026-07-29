import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, Button, Grid, CircularProgress, Alert
} from '@mui/material';
import { leaveApi } from '../../../api/leaveApi';
import { useSnackbar } from 'notistack';

export default function LeaveRequestPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await leaveApi.getTypes();
      setTypes(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat tipe cuti');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      await leaveApi.createRequest(formData);
      enqueueSnackbar('Pengajuan cuti berhasil dibuat', { variant: 'success' });
      navigate('/leave/history');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengajukan cuti');
      enqueueSnackbar('Gagal mengajukan cuti', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Formulir Pengajuan Cuti</Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Tipe Cuti"
                  name="leaveTypeId"
                  value={formData.leaveTypeId}
                  onChange={handleChange}
                  required
                >
                  {types.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name} (Saldo: {type.default_balance} hari)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tanggal Mulai"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tanggal Selesai"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Alasan Cuti"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  placeholder="Jelaskan alasan pengajuan cuti secara singkat"
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large" 
                  disabled={submitting}
                  sx={{ minWidth: 150 }}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Ajukan Cuti'}
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  sx={{ ml: 2 }}
                  onClick={() => navigate('/leave/history')}
                  disabled={submitting}
                >
                  Batal
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

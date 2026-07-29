import { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, Grid, Divider
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { settingsApi } from '../../../api/settingsApi';
import { useSnackbar } from 'notistack';

export default function SystemSettingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    office_latitude: '',
    office_longitude: '',
    geofence_radius_meters: '',
    allowed_ip_ranges: [],
    auto_checkout_time: '',
    leave_carry_over_max: ''
  });
  const [ipInput, setIpInput] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await settingsApi.getConfig();
      if (res.data.data) {
        setFormData((prev) => ({ ...prev, ...res.data.data }));
        if (res.data.data.allowed_ip_ranges) {
          setIpInput(res.data.data.allowed_ip_ranges.join(', '));
        }
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal memuat konfigurasi', { variant: 'error' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIpChange = (e) => {
    setIpInput(e.target.value);
    // Parse comma separated string into array
    const ipArray = e.target.value.split(',').map(ip => ip.trim()).filter(ip => ip);
    setFormData({ ...formData, allowed_ip_ranges: ipArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsApi.updateConfig(formData);
      enqueueSnackbar('Pengaturan berhasil disimpan', { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Gagal menyimpan pengaturan', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Konfigurasi Sistem</Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Geofencing & Lokasi Kantor</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField 
                    label="Latitude Kantor" name="office_latitude" 
                    value={formData.office_latitude} onChange={handleChange} required 
                  />
                  <TextField 
                    label="Longitude Kantor" name="office_longitude" 
                    value={formData.office_longitude} onChange={handleChange} required 
                  />
                  <TextField 
                    label="Radius Geofence (Meter)" name="geofence_radius_meters" type="number"
                    value={formData.geofence_radius_meters} onChange={handleChange} required 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Keamanan & Aturan</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField 
                    label="Allowed IP Ranges (Pisahkan dengan koma)" 
                    value={ipInput} onChange={handleIpChange} 
                    helperText="Contoh: 192.168.1.0/24, 10.0.0.1. Kosongkan jika membolehkan semua IP."
                  />
                  <TextField 
                    label="Waktu Auto Check-out" name="auto_checkout_time" type="time"
                    value={formData.auto_checkout_time} onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField 
                    label="Maksimal Sisa Cuti Tahun Lalu (Hari)" name="leave_carry_over_max" type="number"
                    value={formData.leave_carry_over_max} onChange={handleChange}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Button 
              type="submit" variant="contained" size="large" 
              startIcon={<SaveIcon />} disabled={loading}
            >
              Simpan Konfigurasi
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

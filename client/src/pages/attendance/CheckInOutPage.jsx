import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, CircularProgress, Alert
} from '@mui/material';
import { attendanceApi } from '../../../api/attendanceApi';
import CameraCapture from '../../../components/attendance/CameraCapture';
import { useSnackbar } from 'notistack';

export default function CheckInOutPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [actionType, setActionType] = useState(null); // 'in' or 'out'

  useEffect(() => {
    fetchTodayData();
    getLocation();
  }, []);

  const fetchTodayData = async () => {
    try {
      const res = await attendanceApi.getToday();
      setTodayAttendance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan Anda telah memberikan izin.');
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleStartCapture = (type) => {
    setActionType(type);
    setShowCamera(true);
  };

  const handleSubmit = async (photoDataUrl) => {
    setShowCamera(false);
    setSubmitting(true);
    
    try {
      const payload = {
        photoUrl: photoDataUrl, // In real app, you'd upload this first and send URL, or send base64 if small enough. We'll send base64 for MVP.
        latitude: location?.latitude,
        longitude: location?.longitude,
      };

      let res;
      if (actionType === 'in') {
        res = await attendanceApi.checkIn(payload);
      } else {
        res = await attendanceApi.checkOut(payload);
      }

      enqueueSnackbar(res.message, { variant: 'success' });
      fetchTodayData();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Gagal menyimpan absensi', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;

  const isCheckedIn = todayAttendance && todayAttendance.check_in_time;
  const isCheckedOut = todayAttendance && todayAttendance.check_out_time;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Absensi Hari Ini</Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              
              {locationError && (
                <Alert severity="warning" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={getLocation}>Coba Lagi</Button>}>
                  {locationError}
                </Alert>
              )}

              {showCamera ? (
                <CameraCapture 
                  onCapture={handleSubmit} 
                  onCancel={() => setShowCamera(false)} 
                />
              ) : (
                <Box>
                  <Typography variant="h1" sx={{ mb: 1 }}>
                    {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 4 }}>
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Jam Masuk</Typography>
                        <Typography variant="h6">
                          {isCheckedIn ? new Date(todayAttendance.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Jam Keluar</Typography>
                        <Typography variant="h6">
                          {isCheckedOut ? new Date(todayAttendance.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4 }}>
                    {!isCheckedIn && (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="large" 
                        fullWidth 
                        sx={{ py: 2, fontSize: '1.1rem' }}
                        onClick={() => handleStartCapture('in')}
                        disabled={submitting}
                      >
                        Check In Sekarang
                      </Button>
                    )}
                    
                    {isCheckedIn && !isCheckedOut && (
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large" 
                        fullWidth 
                        sx={{ py: 2, fontSize: '1.1rem' }}
                        onClick={() => handleStartCapture('out')}
                        disabled={submitting}
                      >
                        Check Out Sekarang
                      </Button>
                    )}

                    {isCheckedIn && isCheckedOut && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Anda sudah menyelesaikan absensi hari ini. Terima kasih!
                      </Alert>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

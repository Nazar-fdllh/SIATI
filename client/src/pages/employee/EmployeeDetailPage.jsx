import { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Grid, Avatar, Divider, Chip, Button, CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi } from '../../../api/employeeApi';
import { Edit as EditIcon, Person as PersonIcon } from '@mui/icons-material';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const res = await employeeApi.getById(id);
      setEmployee(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'probation': return 'warning';
      case 'contract': return 'info';
      case 'resigned': case 'terminated': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <CircularProgress />;
  if (!employee) return <Typography>Karyawan tidak ditemukan</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Profil Karyawan</Typography>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/employees/${id}/edit`)}>
          Edit Profil
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}>
              {employee.full_name[0]}
            </Avatar>
            <Typography variant="h5" gutterBottom>{employee.full_name}</Typography>
            <Typography color="text.secondary" gutterBottom>{employee.position_name || 'Tidak ada posisi'}</Typography>
            
            <Chip 
              label={employee.employment_status.toUpperCase()} 
              color={getStatusColor(employee.employment_status)} 
              sx={{ mt: 2 }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" /> Informasi Pribadi
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">NIK</Typography>
                <Typography variant="body1">{employee.employee_code}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Email Akun</Typography>
                <Typography variant="body1">{employee.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">No. Handphone</Typography>
                <Typography variant="body1">{employee.phone || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Departemen</Typography>
                <Typography variant="body1">{employee.department_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Atasan (Supervisor)</Typography>
                <Typography variant="body1">{employee.supervisor_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Tanggal Bergabung</Typography>
                <Typography variant="body1">{new Date(employee.join_date).toLocaleDateString('id-ID')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Shift</Typography>
                <Typography variant="body1">
                  {employee.shift_name ? `${employee.shift_name} (${employee.start_time} - ${employee.end_time})` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Alamat</Typography>
                <Typography variant="body1">{employee.address || '-'}</Typography>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 5, mb: 2 }}>
              Kontak Darurat
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Nama Kontak</Typography>
                <Typography variant="body1">{employee.emergency_contact_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Nomor Telepon</Typography>
                <Typography variant="body1">{employee.emergency_contact_phone || '-'}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

import { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, TextField, MenuItem, Button, CircularProgress, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi } from '../../../api/employeeApi';
import { useSnackbar } from 'notistack';

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'karyawan',
    employeeCode: '',
    fullName: '',
    phone: '',
    departmentId: '',
    positionId: '',
    employmentStatus: 'active',
    joinDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchOptions();
    if (isEdit) {
      fetchEmployee();
    }
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [depRes, posRes] = await Promise.all([
        employeeApi.getDepartments(),
        employeeApi.getPositions()
      ]);
      setDepartments(depRes.data);
      setPositions(posRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployee = async () => {
    try {
      const res = await employeeApi.getById(id);
      const data = res.data;
      setFormData({
        email: data.email || '',
        password: '',
        role: data.role_name || 'karyawan',
        employeeCode: data.employee_code || '',
        fullName: data.full_name || '',
        phone: data.phone || '',
        departmentId: data.department_id || '',
        positionId: data.position_id || '',
        employmentStatus: data.employment_status || 'active',
        joinDate: data.join_date ? data.join_date.split('T')[0] : '',
      });
    } catch (err) {
      setError('Gagal memuat data karyawan');
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
      const payload = { ...formData };
      
      // Remove empty string IDs to avoid UUID cast errors in postgres
      if (!payload.departmentId) delete payload.departmentId;
      if (!payload.positionId) delete payload.positionId;
      if (!payload.password && isEdit) delete payload.password; // Don't send empty password on edit
      
      if (isEdit) {
        await employeeApi.update(id, payload);
        enqueueSnackbar('Data karyawan berhasil diperbarui', { variant: 'success' });
      } else {
        await employeeApi.create(payload);
        enqueueSnackbar('Karyawan berhasil ditambahkan', { variant: 'success' });
      }
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
      enqueueSnackbar('Gagal menyimpan data', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {isEdit ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Data Akun</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Email Login" name="email"
                  value={formData.email} onChange={handleChange}
                  required disabled={isEdit} type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label={isEdit ? "Password Baru (Opsional)" : "Password"} name="password"
                  value={formData.password} onChange={handleChange}
                  required={!isEdit} type="password"
                />
              </Grid>
              {!isEdit && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    select fullWidth label="Hak Akses (Role)" name="role"
                    value={formData.role} onChange={handleChange} required
                  >
                    <MenuItem value="karyawan">Karyawan Biasa</MenuItem>
                    <MenuItem value="supervisor">Supervisor / Manajer</MenuItem>
                    <MenuItem value="hrd">HRD / Personalia</MenuItem>
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                  </TextField>
                </Grid>
              )}

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Profil Karyawan</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="NIK (Nomor Induk Karyawan)" name="employeeCode"
                  value={formData.employeeCode} onChange={handleChange} required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Nama Lengkap" name="fullName"
                  value={formData.fullName} onChange={handleChange} required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Departemen" name="departmentId"
                  value={formData.departmentId} onChange={handleChange}
                >
                  <MenuItem value="">Tidak ada</MenuItem>
                  {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Jabatan/Posisi" name="positionId"
                  value={formData.positionId} onChange={handleChange}
                >
                  <MenuItem value="">Tidak ada</MenuItem>
                  {positions.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth type="date" label="Tanggal Bergabung" name="joinDate"
                  value={formData.joinDate} onChange={handleChange} required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Status Karyawan" name="employmentStatus"
                  value={formData.employmentStatus} onChange={handleChange} required
                >
                  <MenuItem value="active">Aktif (Tetap)</MenuItem>
                  <MenuItem value="contract">Kontrak</MenuItem>
                  <MenuItem value="probation">Masa Percobaan</MenuItem>
                  <MenuItem value="resigned">Resign</MenuItem>
                  <MenuItem value="terminated">Diberhentikan</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sx={{ mt: 3 }}>
                <Button type="submit" variant="contained" size="large" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </Button>
                <Button variant="outlined" size="large" sx={{ ml: 2 }} onClick={() => navigate('/employees')} disabled={submitting}>
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

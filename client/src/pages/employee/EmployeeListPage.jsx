import { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination, Button, Avatar, InputAdornment, TextField
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { employeeApi } from '../../../api/employeeApi';
import { useNavigate } from 'react-router-dom';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees(meta.page, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [meta.page, searchTerm]);

  const fetchEmployees = async (page, search) => {
    setLoading(true);
    try {
      const res = await employeeApi.getAll({ page, limit: 10, search });
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
      case 'active': return 'success';
      case 'probation': return 'warning';
      case 'contract': return 'info';
      case 'resigned': case 'terminated': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Data Karyawan</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/employees/new')}>
          + Tambah Karyawan
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            size="small"
            placeholder="Cari nama atau NIK..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setMeta(prev => ({...prev, page: 1}));
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Karyawan</TableCell>
                <TableCell>NIK</TableCell>
                <TableCell>Departemen</TableCell>
                <TableCell>Posisi</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">Data tidak ditemukan</TableCell></TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/employees/${row.id}`)}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>{row.full_name[0]}</Avatar>
                        <Typography variant="body2">{row.full_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.employee_code}</TableCell>
                    <TableCell>{row.department_name || '-'}</TableCell>
                    <TableCell>{row.position_name || '-'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.employment_status.toUpperCase()} color={getStatusColor(row.employment_status)} />
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
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

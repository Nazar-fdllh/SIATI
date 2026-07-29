import { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination
} from '@mui/material';
import { leaveApi } from '../../../api/leaveApi';

export default function LeaveHistoryPage() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory(meta.page);
  }, [meta.page]);

  const fetchHistory = async (page) => {
    setLoading(true);
    try {
      const res = await leaveApi.getMyRequests({ page, limit: 10 });
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
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': case 'approved_l1': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Menunggu',
      approved_l1: 'Menunggu HRD',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      cancelled: 'Dibatalkan'
    };
    return labels[status] || status;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Riwayat Pengajuan Cuti</Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tgl Pengajuan</TableCell>
                <TableCell>Tipe Cuti</TableCell>
                <TableCell>Mulai</TableCell>
                <TableCell>Selesai</TableCell>
                <TableCell>Durasi (Hari)</TableCell>
                <TableCell>Alasan</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center">Loading...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">Belum ada riwayat pengajuan cuti</TableCell></TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{row.leave_type_name}</TableCell>
                    <TableCell>{new Date(row.start_date).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{new Date(row.end_date).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{row.total_days}</TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.reason}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={getStatusLabel(row.status)} color={getStatusColor(row.status)} />
                    </TableCell>
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

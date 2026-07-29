import { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { leaveApi } from '../../../api/leaveApi';
import { useSnackbar } from 'notistack';

export default function LeaveApprovalPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApprovals(meta.page);
  }, [meta.page]);

  const fetchApprovals = async (page) => {
    setLoading(true);
    try {
      const res = await leaveApi.getApprovals({ page, limit: 10 });
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setRemarks('');
    setOpen(true);
  };

  const handleAction = async () => {
    if (actionType === 'reject' && !remarks.trim()) {
      enqueueSnackbar('Alasan penolakan wajib diisi', { variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      if (actionType === 'approve') {
        const res = await leaveApi.approve(selectedRequest.id, remarks);
        enqueueSnackbar(res.message, { variant: 'success' });
      } else {
        const res = await leaveApi.reject(selectedRequest.id, remarks);
        enqueueSnackbar(res.message, { variant: 'info' });
      }
      setOpen(false);
      fetchApprovals(meta.page);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Terjadi kesalahan', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Persetujuan Cuti</Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Karyawan</TableCell>
                <TableCell>Tipe Cuti</TableCell>
                <TableCell>Periode</TableCell>
                <TableCell>Total (Hari)</TableCell>
                <TableCell>Alasan</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">Tidak ada pengajuan cuti yang menunggu persetujuan Anda</TableCell></TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Typography variant="body2">{row.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.department_name}</Typography>
                    </TableCell>
                    <TableCell>{row.leave_type_name}</TableCell>
                    <TableCell>
                      {new Date(row.start_date).toLocaleDateString('id-ID')} - {new Date(row.end_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>{row.total_days}</TableCell>
                    <TableCell>{row.reason}</TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" color="success" sx={{ mr: 1, mb: 1 }} onClick={() => handleOpenDialog(row, 'approve')}>
                        Setujui
                      </Button>
                      <Button size="small" variant="outlined" color="error" sx={{ mb: 1 }} onClick={() => handleOpenDialog(row, 'reject')}>
                        Tolak
                      </Button>
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

      <Dialog open={open} onClose={() => !submitting && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Setujui Pengajuan Cuti' : 'Tolak Pengajuan Cuti'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2"><strong>Karyawan:</strong> {selectedRequest.full_name}</Typography>
              <Typography variant="body2"><strong>Tanggal:</strong> {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()}</Typography>
              <Typography variant="body2"><strong>Alasan:</strong> {selectedRequest.reason}</Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label={actionType === 'approve' ? 'Catatan (Opsional)' : 'Alasan Penolakan (Wajib)'}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required={actionType === 'reject'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={submitting}>Batal</Button>
          <Button onClick={handleAction} variant="contained" color={actionType === 'approve' ? 'success' : 'error'} disabled={submitting}>
            {submitting ? 'Menyimpan...' : (actionType === 'approve' ? 'Setujui' : 'Tolak')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

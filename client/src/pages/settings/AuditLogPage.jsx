import { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination
} from '@mui/material';
import { settingsApi } from '../../../api/settingsApi';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  const fetchLogs = async () => {
    try {
      const res = await settingsApi.getAuditLogs({ page: page + 1, limit: rowsPerPage });
      setLogs(res.data.data);
      setTotal(res.data.meta.total);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Audit Logs</Typography>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Waktu</TableCell>
                <TableCell>Aksi</TableCell>
                <TableCell>Modul</TableCell>
                <TableCell>User</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Tidak ada log aktivitas</TableCell>
                </TableRow>
              ) : (
                logs.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.created_at).toLocaleString('id-ID')}</TableCell>
                    <TableCell>{row.action}</TableCell>
                    <TableCell>{row.module}</TableCell>
                    <TableCell>{row.user_name || row.user_email}</TableCell>
                    <TableCell>{row.ip_address || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </Box>
  );
}

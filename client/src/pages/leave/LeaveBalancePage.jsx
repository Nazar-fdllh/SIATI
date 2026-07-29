import { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Grid, LinearProgress, alpha, CircularProgress
} from '@mui/material';
import { leaveApi } from '../../../api/leaveApi';

export default function LeaveBalancePage() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const res = await leaveApi.getBalances();
      setBalances(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Saldo Cuti Saya</Typography>

      <Grid container spacing={3}>
        {balances.map((balance) => {
          const usedPercent = (balance.used / balance.total_balance) * 100;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={balance.id}>
              <Card sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>{balance.leave_type_name}</Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">Tersedia</Typography>
                  <Typography variant="h6" color="primary">{balance.remaining} Hari</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Terpakai</Typography>
                  <Typography variant="body2">{balance.used} / {balance.total_balance} Hari</Typography>
                </Box>

                <LinearProgress 
                  variant="determinate" 
                  value={usedPercent} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: alpha('#6366F1', 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: usedPercent > 80 ? '#EF4444' : usedPercent > 50 ? '#F59E0B' : '#6366F1',
                    }
                  }} 
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

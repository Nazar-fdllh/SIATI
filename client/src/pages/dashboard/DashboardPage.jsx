import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, alpha, Chip, LinearProgress, CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon, CheckCircle as CheckIcon, Schedule as LateIcon,
  EventBusy as LeaveIcon, TrendingUp as TrendingIcon, Fingerprint as AttendanceIcon,
  CalendarMonth as CalendarIcon, NotificationsActive as NotifIcon,
} from '@mui/icons-material';
import { dashboardApi } from '../../../api/dashboardApi';

const statusColor = {
  present: '#22C55E',
  late: '#F59E0B',
  leave: '#3B82F6',
  approved: '#8B5CF6',
  leave_request: '#F59E0B',
  check_in: '#22C55E',
};

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentActivities(5)
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentHour = new Date().getHours();
  let greeting = 'Selamat Pagi';
  if (currentHour >= 12 && currentHour < 15) greeting = 'Selamat Siang';
  else if (currentHour >= 15 && currentHour < 18) greeting = 'Selamat Sore';
  else if (currentHour >= 18) greeting = 'Selamat Malam';

  if (loading || !stats) {
    return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  }

  const statCards = [
    {
      title: 'Total Karyawan',
      value: stats.total_employees.toString(),
      change: 'Aktif',
      icon: <PeopleIcon />,
      gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      shadowColor: 'rgba(99,102,241,0.3)',
    },
    {
      title: 'Hadir Hari Ini',
      value: stats.today.total_checked_in.toString(),
      change: `${stats.today.total_checked_in > 0 ? Math.round((stats.today.total_checked_in / stats.total_employees) * 100) : 0}%`,
      icon: <CheckIcon />,
      gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      shadowColor: 'rgba(34,197,94,0.3)',
    },
    {
      title: 'Terlambat',
      value: stats.today.late.toString(),
      change: `${stats.today.late > 0 ? Math.round((stats.today.late / stats.today.total_checked_in) * 100) : 0}%`,
      icon: <LateIcon />,
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      shadowColor: 'rgba(245,158,11,0.3)',
    },
    {
      title: 'Cuti / Izin',
      value: (stats.today.leave + stats.today.sick + stats.today.permit).toString(),
      change: 'Hari ini',
      icon: <LeaveIcon />,
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      shadowColor: 'rgba(59,130,246,0.3)',
    },
  ];

  return (
    <Box className="fade-in">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>{greeting} 👋</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {user?.employee?.full_name || user?.email || 'User'} — Berikut ringkasan kehadiran hari ini
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((card, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card
              sx={{
                position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 40px ${card.shadowColor}` },
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h1" sx={{ fontSize: '2rem', lineHeight: 1 }}>{card.value}</Typography>
                  </Box>
                  <Avatar sx={{ background: card.gradient, width: 44, height: 44, boxShadow: `0 4px 16px ${card.shadowColor}` }}>
                    {card.icon}
                  </Avatar>
                </Box>
                <Chip
                  label={card.change} size="small"
                  icon={<TrendingIcon sx={{ fontSize: '0.8rem !important' }} />}
                  sx={{
                    height: 24, fontSize: '0.7rem', fontWeight: 600,
                    background: alpha(card.shadowColor.replace('0.3', '1'), 0.1),
                    color: card.gradient.includes('#22C55E') ? '#4ADE80' : card.gradient.includes('#F59E0B') ? '#FBBF24' : '#818CF8',
                    border: 'none',
                  }}
                />
              </CardContent>
              <Box
                sx={{
                  position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                  borderRadius: '50%', background: card.gradient, opacity: 0.06, filter: 'blur(20px)',
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ color: '#6366F1', fontSize: '1.2rem' }} /> Aksi Cepat
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Check-in Sekarang', color: '#22C55E', icon: '🕐', path: '/attendance/checkin' },
                  { label: 'Ajukan Cuti', color: '#3B82F6', icon: '📝', path: '/leave/request' },
                  { label: 'Riwayat Absensi', color: '#8B5CF6', icon: '📊', path: '/attendance/history' },
                  { label: 'Saldo Cuti Saya', color: '#F59E0B', icon: '💰', path: '/leave/balance' },
                ].map((action, i) => (
                  <Box
                    key={i}
                    onClick={() => navigate(action.path)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5,
                      borderRadius: 2, border: `1px solid ${alpha(action.color, 0.15)}`, cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { background: alpha(action.color, 0.08), borderColor: alpha(action.color, 0.3), transform: 'translateX(4px)' },
                    }}
                  >
                    <Typography fontSize="1.2rem">{action.icon}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>{action.label}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotifIcon sx={{ color: '#6366F1', fontSize: '1.2rem' }} /> Aktivitas Terkini
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {activities.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>Belum ada aktivitas hari ini</Typography>
                ) : (
                  activities.map((activity, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5,
                        borderRadius: 2, transition: 'background 0.15s ease',
                        '&:hover': { background: alpha('#6366F1', 0.04) },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36, height: 36, fontSize: '0.8rem',
                          background: alpha(statusColor[activity.type] || '#6366F1', 0.15),
                          color: statusColor[activity.type] || '#6366F1',
                        }}
                      >
                        {activity.user_name.split(' ').map((n) => n[0]).join('').substring(0,2)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>{activity.user_name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {activity.type === 'check_in' ? 'Check-in ' + activity.status : `Pengajuan cuti ${activity.leave_type}`}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {new Date(activity.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5 }}>📈 Ringkasan Kehadiran Bulan Ini</Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'Tingkat Kehadiran', value: stats.attendance_rate, color: '#22C55E' },
                  { label: 'Tepat Waktu', value: stats.ontime_rate, color: '#6366F1' },
                ].map((metric, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>{metric.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: metric.color }}>{metric.value}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate" value={metric.value}
                        sx={{
                          height: 8, borderRadius: 4, backgroundColor: alpha(metric.color, 0.1),
                          '& .MuiLinearProgress-bar': { borderRadius: 4, background: `linear-gradient(90deg, ${metric.color} 0%, ${alpha(metric.color, 0.7)} 100%)` },
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

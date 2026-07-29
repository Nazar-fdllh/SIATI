import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  alpha,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  Schedule as LateIcon,
  EventBusy as LeaveIcon,
  TrendingUp as TrendingIcon,
  Fingerprint as AttendanceIcon,
  CalendarMonth as CalendarIcon,
  NotificationsActive as NotifIcon,
} from '@mui/icons-material';

const statCards = [
  {
    title: 'Total Karyawan',
    value: '30',
    change: '+2',
    icon: <PeopleIcon />,
    gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    shadowColor: 'rgba(99,102,241,0.3)',
  },
  {
    title: 'Hadir Hari Ini',
    value: '26',
    change: '86.7%',
    icon: <CheckIcon />,
    gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    shadowColor: 'rgba(34,197,94,0.3)',
  },
  {
    title: 'Terlambat',
    value: '3',
    change: '10%',
    icon: <LateIcon />,
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    shadowColor: 'rgba(245,158,11,0.3)',
  },
  {
    title: 'Cuti / Izin',
    value: '1',
    change: '3.3%',
    icon: <LeaveIcon />,
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    shadowColor: 'rgba(59,130,246,0.3)',
  },
];

const recentActivities = [
  { user: 'Ahmad Fauzi', action: 'Check-in', time: '08:02', status: 'present', icon: <AttendanceIcon /> },
  { user: 'Siti Rahayu', action: 'Mengajukan cuti', time: '09:15', status: 'leave', icon: <LeaveIcon /> },
  { user: 'Budi Santoso', action: 'Check-in (terlambat)', time: '09:32', status: 'late', icon: <LateIcon /> },
  { user: 'Dewi Lestari', action: 'Cuti disetujui', time: '10:00', status: 'approved', icon: <CheckIcon /> },
  { user: 'Eko Prasetyo', action: 'Check-out', time: '17:05', status: 'present', icon: <AttendanceIcon /> },
];

const statusColor = {
  present: '#22C55E',
  late: '#F59E0B',
  leave: '#3B82F6',
  approved: '#8B5CF6',
};

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const currentHour = new Date().getHours();
  let greeting = 'Selamat Pagi';
  if (currentHour >= 12 && currentHour < 15) greeting = 'Selamat Siang';
  else if (currentHour >= 15 && currentHour < 18) greeting = 'Selamat Sore';
  else if (currentHour >= 18) greeting = 'Selamat Malam';

  return (
    <Box className="fade-in">
      {/* Greeting */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          {greeting} 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {user?.employee?.full_name || user?.email || 'User'} — Berikut ringkasan kehadiran hari ini
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={idx}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 40px ${card.shadowColor}`,
                },
              }}
            >
              <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h1" sx={{ fontSize: '2rem', lineHeight: 1 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      background: card.gradient,
                      width: 44,
                      height: 44,
                      boxShadow: `0 4px 16px ${card.shadowColor}`,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                </Box>
                <Chip
                  label={card.change}
                  size="small"
                  icon={<TrendingIcon sx={{ fontSize: '0.8rem !important' }} />}
                  sx={{
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: alpha(card.shadowColor.replace('0.3', '1'), 0.1),
                    color: card.gradient.includes('#22C55E') ? '#4ADE80' : card.gradient.includes('#F59E0B') ? '#FBBF24' : '#818CF8',
                    border: 'none',
                  }}
                />
              </CardContent>
              {/* Decorative gradient */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: card.gradient,
                  opacity: 0.06,
                  filter: 'blur(20px)',
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ color: '#6366F1', fontSize: '1.2rem' }} />
                Aksi Cepat
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Check-in Sekarang', color: '#22C55E', icon: '🕐' },
                  { label: 'Ajukan Cuti', color: '#3B82F6', icon: '📝' },
                  { label: 'Riwayat Absensi', color: '#8B5CF6', icon: '📊' },
                  { label: 'Saldo Cuti Saya', color: '#F59E0B', icon: '💰' },
                ].map((action, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(action.color, 0.15)}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: alpha(action.color, 0.08),
                        borderColor: alpha(action.color, 0.3),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Typography fontSize="1.2rem">{action.icon}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                      {action.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotifIcon sx={{ color: '#6366F1', fontSize: '1.2rem' }} />
                Aktivitas Terkini
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {recentActivities.map((activity, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      transition: 'background 0.15s ease',
                      '&:hover': { background: alpha('#6366F1', 0.04) },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        fontSize: '0.8rem',
                        background: alpha(statusColor[activity.status] || '#6366F1', 0.15),
                        color: statusColor[activity.status] || '#6366F1',
                      }}
                    >
                      {activity.user.split(' ').map((n) => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                        {activity.user}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {activity.action}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Summary */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5 }}>
                📈 Ringkasan Kehadiran Bulan Ini
              </Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'Tingkat Kehadiran', value: 92, color: '#22C55E' },
                  { label: 'Tepat Waktu', value: 85, color: '#6366F1' },
                  { label: 'Penggunaan Cuti', value: 15, color: '#3B82F6' },
                ].map((metric, i) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={i}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                          {metric.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: metric.color }}>
                          {metric.value}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={metric.value}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(metric.color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${metric.color} 0%, ${alpha(metric.color, 0.7)} 100%)`,
                          },
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

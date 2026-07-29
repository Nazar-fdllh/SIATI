import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Fingerprint as AttendanceIcon,
  EventNote as LeaveIcon,
  People as EmployeeIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  CalendarMonth as CalendarIcon,
  Schedule as ShiftIcon,
  Security as AuditIcon,
} from '@mui/icons-material';

const mainMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Absensi', icon: <AttendanceIcon />, path: '/attendance' },
  { text: 'Pengajuan Cuti', icon: <LeaveIcon />, path: '/leave/request' },
  { text: 'Data Karyawan', icon: <EmployeeIcon />, path: '/employees', roles: ['super_admin', 'hrd'] },
  { text: 'Laporan', icon: <ReportIcon />, path: '/reports/attendance', roles: ['super_admin', 'hrd', 'supervisor'] },
];

const settingsMenuItems = [
  { text: 'Hari Libur', icon: <CalendarIcon />, path: '/settings/holidays', roles: ['super_admin', 'hrd'] },
  { text: 'Kelola Shift', icon: <ShiftIcon />, path: '/settings/shifts', roles: ['super_admin', 'hrd'] },
  { text: 'Kelola Role', icon: <AdminIcon />, path: '/settings/roles', roles: ['super_admin'] },
  { text: 'Audit Log', icon: <AuditIcon />, path: '/settings/audit', roles: ['super_admin'] },
  { text: 'Pengaturan', icon: <SettingsIcon />, path: '/settings/system', roles: ['super_admin'] },
];

export default function Sidebar({ drawerWidth, mobileOpen, onClose, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const userRole = user?.role || user?.role_name || '';

  const filterByRole = (items) =>
    items.filter((item) => !item.roles || item.roles.includes(userRole));

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo & Brand */}
      <Box
        sx={{
          px: 3,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}
        >
          S
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
            SIATI
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
            Sistem Absensi & Cuti
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, borderColor: alpha('#6366F1', 0.1) }} />

      {/* Main Menu */}
      <Box sx={{ flex: 1, px: 1.5, py: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            py: 0.5,
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.65rem',
          }}
        >
          Menu Utama
        </Typography>
        <List dense sx={{ mt: 0.5 }}>
          {filterByRole(mainMenuItems).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 0.5,
                    py: 1,
                    px: 1.5,
                    transition: 'all 0.2s ease',
                    ...(isActive && {
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      '& .MuiListItemIcon-root': { color: '#818CF8' },
                      '& .MuiListItemText-primary': { color: '#F1F5F9', fontWeight: 600 },
                    }),
                    ...(!isActive && {
                      '&:hover': {
                        background: alpha('#6366F1', 0.06),
                      },
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? '#818CF8' : '#64748B',
                      '& svg': { fontSize: '1.2rem' },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#F1F5F9' : '#94A3B8',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Settings Menu */}
        {filterByRole(settingsMenuItems).length > 0 && (
          <>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                py: 0.5,
                mt: 2,
                display: 'block',
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.65rem',
              }}
            >
              Pengaturan
            </Typography>
            <List dense sx={{ mt: 0.5 }}>
              {filterByRole(settingsMenuItems).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
                    <ListItemButton
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        borderRadius: 2,
                        mx: 0.5,
                        py: 1,
                        px: 1.5,
                        transition: 'all 0.2s ease',
                        ...(isActive && {
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                          border: '1px solid rgba(99,102,241,0.2)',
                        }),
                        ...(!isActive && {
                          '&:hover': { background: alpha('#6366F1', 0.06) },
                        }),
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive ? '#818CF8' : '#64748B',
                          '& svg': { fontSize: '1.2rem' },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#F1F5F9' : '#94A3B8',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </Box>

      <Divider sx={{ mx: 2, borderColor: alpha('#6366F1', 0.1) }} />

      {/* User Info */}
      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          transition: 'background 0.2s',
          '&:hover': { background: alpha('#6366F1', 0.06) },
          borderRadius: 2,
          mx: 1,
          mb: 1,
        }}
        onClick={() => handleNavigate('/profile')}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: '0.85rem',
          }}
        >
          {user?.employee?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user?.employee?.full_name || user?.email || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
            {user?.role_name || user?.role || 'Karyawan'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: 0 }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

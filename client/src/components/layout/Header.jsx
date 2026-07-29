import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  LockReset as LockIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { logoutUser } from '../../store/slices/authSlice';

export default function Header({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ px: { xs: 1.5, sm: 3 } }}>
        {/* Mobile menu button */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 1, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page title area */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: '0.7rem', display: { xs: 'none', sm: 'block' } }}
          >
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Typography>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifikasi">
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={0} color="error" max={99}>
              <NotificationsIcon sx={{ fontSize: '1.3rem' }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User menu */}
        <Tooltip title="Menu akun">
          <IconButton onClick={handleMenu} size="small">
            <Avatar
              sx={{ width: 34, height: 34, fontSize: '0.85rem' }}
            >
              {user?.employee?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              border: '1px solid rgba(99,102,241,0.15)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.employee?.full_name || user?.email}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.8125rem' }}>Profil Saya</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.8125rem' }}>Ubah Password</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: '0.8125rem' }}>Keluar</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

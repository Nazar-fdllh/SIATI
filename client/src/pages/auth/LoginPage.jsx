import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { loginUser, clearError } from '../../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser({ email, password }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, rgba(59,130,246,0.08) 0%, transparent 50%),
          #0B1120
        `,
        px: 2,
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          position: 'relative',
          overflow: 'visible',
          background: 'linear-gradient(145deg, rgba(21,29,48,0.95) 0%, rgba(15,23,42,0.9) 100%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 4,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.1)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Logo & Brand */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                color: '#fff',
                mb: 2,
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
              }}
            >
              S
            </Box>
            <Typography variant="h1" sx={{ fontSize: '1.75rem', mb: 0.5 }}>
              SIATI
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
            >
              Sistem Informasi Absensi & Cuti Karyawan
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => dispatch(clearError())}
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': { fontSize: '1.1rem' },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              autoComplete="email"
              autoFocus
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
              sx={{ mb: 3.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <VisibilityOff sx={{ fontSize: '1.1rem' }} />
                      ) : (
                        <Visibility sx={{ fontSize: '1.1rem' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || !email || !password}
              sx={{
                py: 1.5,
                fontSize: '0.9375rem',
                fontWeight: 700,
                borderRadius: 2.5,
                position: 'relative',
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Masuk'
              )}
            </Button>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 4,
              color: alpha('#94A3B8', 0.6),
              fontSize: '0.7rem',
            }}
          >
            © {new Date().getFullYear()} SIATI v1.0 — Sistem Absensi & Cuti
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

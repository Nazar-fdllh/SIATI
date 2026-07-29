import { Box, Typography, Button, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SentimentDissatisfied as SadIcon } from '@mui/icons-material';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
        background: `
          radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 60%),
          #0B1120
        `,
      }}
    >
      <SadIcon sx={{ fontSize: 80, color: alpha('#6366F1', 0.3), mb: 2 }} />
      <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 800, mb: 1, color: '#6366F1' }}>
        404
      </Typography>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Halaman Tidak Ditemukan
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400 }}>
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/dashboard')}
      >
        Kembali ke Dashboard
      </Button>
    </Box>
  );
}

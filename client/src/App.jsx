import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import AppRoutes from './routes/AppRoutes';
import { fetchCurrentUser, setLoading } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, transparent 70%)',
        }}
      >
        <CircularProgress
          size={48}
          sx={{
            color: '#6366F1',
          }}
        />
      </Box>
    );
  }

  return <AppRoutes />;
}

export default App;

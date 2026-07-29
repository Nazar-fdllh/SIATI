import { useState, useRef, useCallback } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { Cameraswitch as FlipIcon, PhotoCamera as CameraIcon } from '@mui/icons-material';

export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      setError('Gagal mengakses kamera. Pastikan Anda telah memberikan izin.');
      console.error('Camera error:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode]);

  // Start camera when component mounts
  useState(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFlip = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    startCamera();
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw image
      if (facingMode === 'user') {
        // Mirror the canvas for selfie camera
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 jpeg
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      
      onCapture(photoDataUrl);
    }
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onCancel();
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, mx: 'auto', borderRadius: 2, overflow: 'hidden', bgcolor: '#000' }}>
      {error ? (
        <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
          <Button onClick={startCamera} variant="contained" sx={{ mt: 2 }}>Coba Lagi</Button>
          <Button onClick={handleCancel} variant="outlined" sx={{ mt: 2, ml: 1 }}>Batal</Button>
        </Box>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Controls overlay */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Button onClick={handleCancel} sx={{ color: 'white' }}>Batal</Button>
            
            <IconButton 
              onClick={capturePhoto} 
              disabled={isInitializing || !stream}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                width: 64, 
                height: 64,
                '&:hover': { bgcolor: 'grey.200' },
                '&:disabled': { bgcolor: 'grey.500' }
              }}
            >
              <CameraIcon fontSize="large" />
            </IconButton>
            
            <IconButton onClick={handleFlip} sx={{ color: 'white' }}>
              <FlipIcon />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
}

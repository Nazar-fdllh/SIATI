require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================
// Security Middleware
// ============================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Global rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Terlalu banyak request. Silakan coba lagi nanti.',
    code: 'RATE_LIMITED',
  },
}));

// ============================
// Body Parsing
// ============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================
// Logging
// ============================
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================
// Static Files (uploads)
// ============================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================
// API Routes
// ============================
app.use('/api/v1', routes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SIATI API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ============================
// Serve React in Production
// ============================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ============================
// Error Handler (must be last)
// ============================
app.use(errorHandler);

// ============================
// Start Server
// ============================
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 SIATI Server berjalan di port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Gagal memulai server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;

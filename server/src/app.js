const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { globalLimiter } = require('./middleware/rateLimiter');

const authRoutes      = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const wardRoutes      = require('./routes/wards');
const adminRoutes     = require('./routes/admin');

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight BEFORE helmet
app.options('/{*path}', cors(corsOptions));
app.use(cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(globalLimiter);

const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('Uploads path:', uploadsPath);

app.use('/uploads', express.static(uploadsPath));
app.use('/api/auth',       authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/wards',      wardRoutes);
app.use('/api/admin',      adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart City CMS API is running',
    timestamp: new Date(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
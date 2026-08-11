require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// ── Connect to MongoDB ─────────────────────────────────
connectDB();

// ── Middleware ─────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Code execution rate limit (stricter)
const codeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: 'Too many code executions. Please wait a moment.' },
});
app.use('/api/code/', codeLimiter);

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/code',     require('./routes/code'));
app.use('/api/groups',   require('./routes/groups'));
app.use('/api/ai',       require('./routes/ai'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/levels',   require('./routes/levels'));

// ── Health Check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CodeLearn API is running 🚀',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ── 404 Handler ────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 CodeLearn API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;

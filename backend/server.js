const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ============================================================
// MIDDLEWARES
// ============================================================

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// ============================================================
// ROUTES
// ============================================================

const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const driveRoutes = require('./routes/driveRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// ------------------------------------------------------------
// Authentication Routes
// POST /register
// POST /login
// GET  /me
// ------------------------------------------------------------
app.use('/', authRoutes);
app.use('/api', authRoutes);

// ------------------------------------------------------------
// Company Routes
// GET    /companies
// POST   /companies
// PUT    /companies/:id
// DELETE /companies/:id
// ------------------------------------------------------------
app.use('/companies', companyRoutes);
app.use('/api/companies', companyRoutes);

// ------------------------------------------------------------
// Placement Drive Routes
// GET    /drives
// POST   /drives
// PUT    /drives/:id
// DELETE /drives/:id
// ------------------------------------------------------------
app.use('/drives', driveRoutes);
app.use('/api/drives', driveRoutes);

// ------------------------------------------------------------
// Application Routes
// POST   /apply
// GET    /applications
// PUT    /applications/:id
// DELETE /applications/:id
// ------------------------------------------------------------
app.use('/', applicationRoutes);
app.use('/api', applicationRoutes);

// ============================================================
// ROOT / HEALTH CHECK ROUTE
// ============================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    project: 'Campus Placement Management Portal',
    description: 'MERN Stack Mini Project Backend REST API',
    status: 'Running & Connected to MongoDB Atlas',
    environment: process.env.NODE_ENV || 'development',

    endpoints: {
      authentication: [
        'POST /register',
        'POST /login',
        'GET /me',
      ],

      companies: [
        'GET /companies',
        'POST /companies',
        'PUT /companies/:id',
        'DELETE /companies/:id',
      ],

      placementDrives: [
        'GET /drives',
        'POST /drives',
        'PUT /drives/:id',
        'DELETE /drives/:id',
      ],

      applications: [
        'POST /apply',
        'GET /applications',
        'PUT /applications/:id',
        'DELETE /applications/:id',
      ],

      reports: [
        'GET /reports/placement-stats',
      ],
    },
  });
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ============================================================
// SERVER
// ============================================================

// Render provides process.env.PORT.
// 5000 is used when running locally.
const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 so Render can access the server.
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  app,
  server,
};
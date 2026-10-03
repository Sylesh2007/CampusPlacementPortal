const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development helpful)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Import route modules
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const driveRoutes = require('./routes/driveRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// --- PDF Required Direct REST API Endpoints ---
// Section 12: REST APIs
// Authentication: POST /register, POST /login
app.use('/', authRoutes);
app.use('/api', authRoutes);

// Companies: GET /companies, POST /companies, PUT /companies/:id, DELETE /companies/:id
app.use('/companies', companyRoutes);
app.use('/api/companies', companyRoutes);

// Placement Drives: GET /drives, POST /drives, PUT /drives/:id, DELETE /drives/:id
app.use('/drives', driveRoutes);
app.use('/api/drives', driveRoutes);

// Applications: POST /apply, GET /applications, PUT /applications/:id, DELETE /applications/:id
app.use('/', applicationRoutes);
app.use('/api', applicationRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Campus Placement Management Portal',
    description: 'MERN Stack Mini Project Backend REST API',
    status: 'Running & Connected to MongoDB Atlas',
    endpoints: {
      auth: ['POST /register', 'POST /login', 'GET /me'],
      companies: ['GET /companies', 'POST /companies', 'PUT /companies/:id', 'DELETE /companies/:id'],
      drives: ['GET /drives', 'POST /drives', 'PUT /drives/:id', 'DELETE /drives/:id'],
      applications: ['POST /apply', 'GET /applications', 'PUT /applications/:id', 'DELETE /applications/:id'],
      reports: ['GET /reports/placement-stats'],
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };

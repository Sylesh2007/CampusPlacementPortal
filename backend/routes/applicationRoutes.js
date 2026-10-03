const express = require('express');
const router = express.Router();
const {
  applyForDrive,
  getApplications,
  updateApplication,
  deleteApplication,
  getPlacementReports,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Note: Mounted at both root (/apply, /applications) and /api/... in server.js
// POST /apply - Student applies for a placement drive
router.post('/apply', protect, authorize('student'), applyForDrive);

// GET /applications - Scoped to role (Student, Company, Admin)
router.get('/applications', protect, getApplications);

// PUT /applications/:id - Update status / selection (Company or Admin)
router.put('/applications/:id', protect, authorize('company', 'admin'), updateApplication);

// DELETE /applications/:id - Delete application (Admin)
router.delete('/applications/:id', protect, authorize('admin'), deleteApplication);

// Placement reports demonstrating MongoDB aggregate()
router.get('/reports/placement-stats', protect, authorize('admin'), getPlacementReports);

module.exports = router;

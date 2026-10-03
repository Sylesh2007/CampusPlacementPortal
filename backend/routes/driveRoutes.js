const express = require('express');
const router = express.Router();
const {
  getDrives,
  getDriveById,
  addDrive,
  updateDrive,
  deleteDrive,
} = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /drives - Public / All roles
router.get('/', getDrives);

// GET /drives/:id - Public / All roles
router.get('/:id', getDriveById);

// POST /drives - Company or Admin
router.post('/', protect, authorize('admin', 'company'), addDrive);

// PUT /drives/:id - Company or Admin
router.put('/:id', protect, authorize('admin', 'company'), updateDrive);

// DELETE /drives/:id - Company or Admin
router.delete('/:id', protect, authorize('admin', 'company'), deleteDrive);

module.exports = router;

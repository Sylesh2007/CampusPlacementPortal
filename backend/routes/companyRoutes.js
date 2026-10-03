const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  addCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /companies - Public / All roles
router.get('/', getCompanies);

// GET /companies/:id - Public
router.get('/:id', getCompanyById);

// POST /companies - Admin or Company
router.post('/', protect, authorize('admin', 'company'), addCompany);

// PUT /companies/:id - Admin or Company
router.put('/:id', protect, authorize('admin', 'company'), updateCompany);

// DELETE /companies/:id - Admin only
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;

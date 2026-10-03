const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /register
router.post('/register', registerUser);

// POST /login
router.post('/login', loginUser);

// GET /me (profile verification)
router.get('/me', protect, getMe);

module.exports = router;

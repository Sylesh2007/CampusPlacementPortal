const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'superSecretKey_CampusPlacementManagementPortal_2026_jwt_token',
    {
      expiresIn: '7d',
    }
  );
};

// @desc    Register a new user (Student or Company)
// @route   POST /register or POST /api/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { userId, name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const assignedRole = role && ['student', 'company', 'admin'].includes(role.toLowerCase())
      ? role.toLowerCase()
      : 'student';

    // Check if user with same email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Generate unique userId if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const prefix = assignedRole === 'student' ? 'STU' : assignedRole === 'company' ? 'CMP' : 'ADM';
      finalUserId = `${prefix}${Date.now().toString().slice(-6)}`;
    } else {
      // Check if provided userId is taken
      const idExists = await User.findOne({ userId: finalUserId });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: `User ID '${finalUserId}' is already taken. Please choose another or leave blank for auto-generation.`,
        });
      }
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in MongoDB Atlas
    const newUser = await User.create({
      userId: finalUserId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
    });

    // If company role, also initialize company profile
    if (assignedRole === 'company') {
      const Company = require('../models/Company');
      await Company.create({
        companyId: finalUserId,
        companyName: req.body.companyName || name,
        location: req.body.location || 'Headquarters',
        website: req.body.website || 'https://company.example.com',
        HRName: req.body.HRName || name,
        packageOffered: req.body.packageOffered || 'Competitive CTC',
        eligibilityCriteria: req.body.eligibilityCriteria || 'B.Tech/BE/MCA with min 6.5 CGPA, no standing arrears',
      });
    }

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & return JWT token
// @route   POST /login or POST /api/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user using MongoDB findOne()
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /me or GET /api/me
// @access  Private
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching current user profile.',
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};

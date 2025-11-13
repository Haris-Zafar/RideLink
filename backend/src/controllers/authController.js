import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      university,
      studentId,
      homeNeighborhood,
      city,
      role,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered',
      });
    }

    // Validate email domain
    if (!email.endsWith('.edu.pk')) {
      return res.status(400).json({
        success: false,
        error: 'Please use a valid university email (.edu.pk)',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      phone,
      university,
      studentId,
      homeNeighborhood,
      city,
      role: role || 'passenger',
    });

    logger.info(`New user registered: ${email}`);

    // TODO: Send verification email (will implement in later sprint)

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        userId: user._id,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Get user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Account suspended. Please contact support.',
        suspendedUntil: user.suspendedUntil,
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        error: 'Account banned. Please contact support.',
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken({
      userId: user._id,
      role: user.role,
    });

    logger.info(`User logged in: ${email}`);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toAuthJSON(),
      },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
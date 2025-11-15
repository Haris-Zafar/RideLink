const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, university, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      university,
      role: role || 'passenger'
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    await user.save();

    // TODO: Send verification email

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          university: user.university,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended or banned'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          university: user.university,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          profilePhoto: user.profilePhoto
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Send OTP for phone verification
// @route   POST /api/auth/send-otp
// @access  Private
exports.sendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+phoneOTP +phoneOTPExpires');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.phoneOTP = crypto.createHash('sha256').update(otp).digest('hex');
    user.phoneOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Send OTP via Twilio
    console.log(`OTP for ${user.phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent to your phone',
      // Remove in production
      dev: { otp }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// @desc    Verify phone OTP
// @route   POST /api/auth/verify-phone
// @access  Private
exports.verifyPhone = async (req, res) => {
  try {
    const { otp } = req.body;

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      _id: req.user.id,
      phoneOTP: hashedOTP,
      phoneOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.phoneVerified = true;
    user.phoneOTP = undefined;
    user.phoneOTPExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

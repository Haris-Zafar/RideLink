const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended or banned'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Admin only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

// Verified users only
exports.verifiedOnly = (req, res, next) => {
  if (req.user && req.user.phoneVerified && req.user.emailVerified) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email and phone number first'
    });
  }
};

// Drivers only
exports.driversOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'driver' || req.user.role === 'both')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'This action is only available to drivers'
    });
  }
};

import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check cookies (if using cookie-based auth)
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Please login.',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found. Token invalid.',
      });
    }

    // Check if user is suspended or banned
    if (user.status === 'suspended' || user.status === 'banned') {
      return res.status(403).json({
        success: false,
        error: `Account ${user.status}. Please contact support.`,
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
};

/**
 * Authorize specific roles
 * @param  {...String} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

/**
 * Require verified users (email + phone)
 */
export const requireVerified = (req, res, next) => {
  if (!req.user.emailVerified || !req.user.phoneVerified) {
    return res.status(403).json({
      success: false,
      error: 'Please verify your email and phone number to access this feature.',
      details: {
        emailVerified: req.user.emailVerified,
        phoneVerified: req.user.phoneVerified,
      },
    });
  }
  next();
};

/**
 * Require driver role with vehicle
 */
export const requireDriver = (req, res, next) => {
  if (req.user.role !== 'driver' && req.user.role !== 'both') {
    return res.status(403).json({
      success: false,
      error: 'Only drivers can access this resource.',
    });
  }

  if (!req.user.vehicle) {
    return res.status(403).json({
      success: false,
      error: 'Please add vehicle details to post rides.',
    });
  }

  next();
};
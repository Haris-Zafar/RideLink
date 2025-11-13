import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', authLimiter, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
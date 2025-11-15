const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  logout,
  sendOTP,
  verifyPhone
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/send-otp', protect, sendOTP);
router.post('/verify-phone', protect, verifyPhone);

module.exports = router;

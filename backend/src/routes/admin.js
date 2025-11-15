const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  updateUserStatus,
  getAllReports,
  resolveReport,
  getAnalytics,
  submitReport
} = require('../controllers/adminController');

// User management
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/status', protect, adminOnly, updateUserStatus);

// Reports management
router.get('/reports', protect, adminOnly, getAllReports);
router.put('/reports/:id/resolve', protect, adminOnly, resolveReport);

// Analytics
router.get('/analytics', protect, adminOnly, getAnalytics);

// Submit report (any authenticated user)
router.post('/reports', protect, submitReport);

module.exports = router;

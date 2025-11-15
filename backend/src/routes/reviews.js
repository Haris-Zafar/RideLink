const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  submitReview,
  getUserReviews,
  getRideReviews
} = require('../controllers/reviewController');

router.post('/', protect, submitReview);
router.get('/user/:userId', getUserReviews);
router.get('/ride/:rideId', protect, getRideReviews);

module.exports = router;

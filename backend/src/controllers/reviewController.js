const Review = require('../models/Review');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private
exports.submitReview = async (req, res) => {
  try {
    const { rideId, revieweeId, rating, comment, tags } = req.body;

    // Check if ride exists and is completed
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed rides'
      });
    }

    // Check if user was part of the ride
    const isDriver = ride.driver.toString() === req.user.id;
    const isPassenger = ride.passengers.some(p => p.toString() === req.user.id);

    if (!isDriver && !isPassenger) {
      return res.status(403).json({
        success: false,
        message: 'You were not part of this ride'
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      ride: rideId,
      reviewer: req.user.id,
      reviewee: revieweeId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this person for this ride'
      });
    }

    // Determine review type
    let reviewType;
    if (ride.driver.toString() === revieweeId) {
      reviewType = 'driver';
    } else if (ride.passengers.some(p => p.toString() === revieweeId)) {
      reviewType = 'passenger';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Reviewee was not part of this ride'
      });
    }

    const review = await Review.create({
      ride: rideId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      reviewType,
      rating,
      comment,
      tags: tags || []
    });

    await review.populate('reviewer', 'name profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit review'
    });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // 'driver' or 'passenger'

    const query = { reviewee: userId };
    if (type) {
      query.reviewType = type;
    }

    const reviews = await Review.find(query)
      .populate('reviewer', 'name profilePhoto university')
      .populate('ride', 'origin destination date')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews'
    });
  }
};

// @desc    Get review for a specific ride
// @route   GET /api/reviews/ride/:rideId
// @access  Private
exports.getRideReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ ride: req.params.rideId })
      .populate('reviewer', 'name profilePhoto')
      .populate('reviewee', 'name profilePhoto');

    res.json({
      success: true,
      count: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get ride reviews'
    });
  }
};

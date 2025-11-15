const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['driver', 'passenger'],
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    enum: [
      'punctual',
      'friendly',
      'safe-driver',
      'clean-car',
      'good-conversation',
      'quiet',
      'professional',
      'respectful',
      'helpful',
      'unreliable',
      'rude',
      'unsafe'
    ]
  }]
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ ride: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, reviewType: 1 });

// Update user rating after review is saved
reviewSchema.post('save', async function() {
  const User = mongoose.model('User');
  const Review = mongoose.model('Review');

  // Calculate new average rating for reviewee
  const reviews = await Review.find({
    reviewee: this.reviewee,
    reviewType: this.reviewType
  });

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = totalRating / reviews.length;

  // Update user's rating
  const updateField = this.reviewType === 'driver'
    ? 'driverRating'
    : 'passengerRating';

  await User.findByIdAndUpdate(this.reviewee, {
    [`${updateField}.average`]: avgRating,
    [`${updateField}.count`]: reviews.length
  });
});

module.exports = mongoose.model('Review', reviewSchema);

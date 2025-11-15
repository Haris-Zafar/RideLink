const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedRide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  },
  type: {
    type: String,
    enum: ['user', 'ride'],
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    enum: [
      'inappropriate-behavior',
      'harassment',
      'safety-concern',
      'no-show',
      'fraud',
      'spam',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1 });

module.exports = mongoose.model('Report', reportSchema);

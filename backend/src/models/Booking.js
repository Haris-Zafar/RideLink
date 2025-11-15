const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  seatsRequested: {
    type: Number,
    default: 1,
    min: [1, 'Must request at least 1 seat'],
    max: [4, 'Maximum 4 seats per booking']
  },
  amountDue: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'digital'],
    default: 'cash'
  },
  message: {
    type: String,
    maxlength: [200, 'Message cannot exceed 200 characters']
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ ride: 1, passenger: 1 });
bookingSchema.index({ passenger: 1, status: 1 });
bookingSchema.index({ driver: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

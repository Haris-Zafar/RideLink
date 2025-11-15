const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    type: String,
    required: [true, 'Origin is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  departureDateTime: {
    type: Date,
    required: true
  },
  availableSeats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [1, 'Must have at least 1 seat'],
    max: [4, 'Maximum 4 seats allowed']
  },
  totalSeats: {
    type: Number,
    required: true
  },
  costPerPassenger: {
    type: Number,
    required: [true, 'Cost per passenger is required'],
    min: [0, 'Cost cannot be negative']
  },
  preferences: {
    nonSmoking: {
      type: Boolean,
      default: true
    },
    acAvailable: {
      type: Boolean,
      default: false
    },
    musicAllowed: {
      type: Boolean,
      default: true
    },
    petsAllowed: {
      type: Boolean,
      default: false
    }
  },
  passengers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  route: {
    distance: Number,
    duration: Number,
    polyline: String
  },
  recurringScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringSchedule'
  }
}, {
  timestamps: true
});

// Indexes for search performance
rideSchema.index({ origin: 1, destination: 1, date: 1 });
rideSchema.index({ driver: 1, date: -1 });
rideSchema.index({ status: 1, date: 1 });
rideSchema.index({ departureDateTime: 1 });

// Virtual for checking if ride is full
rideSchema.virtual('isFull').get(function() {
  return this.availableSeats === 0;
});

module.exports = mongoose.model('Ride', rideSchema);

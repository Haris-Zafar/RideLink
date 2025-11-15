const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

// @desc    Request to join a ride
// @route   POST /api/bookings/request
// @access  Private
exports.requestBooking = async (req, res) => {
  try {
    const { rideId, seatsRequested, message } = req.body;

    const ride = await Ride.findById(rideId).populate('driver');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if ride is available
    if (ride.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'This ride is not available for booking'
      });
    }

    // Check if user is the driver
    if (ride.driver._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own ride'
      });
    }

    // Check if enough seats available
    if (ride.availableSeats < seatsRequested) {
      return res.status(400).json({
        success: false,
        message: `Only ${ride.availableSeats} seat(s) available`
      });
    }

    // Check if user already has a booking
    const existingBooking = await Booking.findOne({
      ride: rideId,
      passenger: req.user.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a booking for this ride'
      });
    }

    const booking = await Booking.create({
      ride: rideId,
      passenger: req.user.id,
      driver: ride.driver._id,
      seatsRequested: seatsRequested || 1,
      amountDue: ride.costPerPassenger * (seatsRequested || 1),
      message
    });

    await booking.populate('passenger', 'name profilePhoto university passengerRating');

    // TODO: Notify driver

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Request booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to request booking'
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { passenger: req.user.id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('ride')
      .populate('driver', 'name profilePhoto phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings'
    });
  }
};

// @desc    Get bookings for a ride (driver view)
// @route   GET /api/bookings/ride/:rideId
// @access  Private (Driver only)
exports.getRideBookings = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const bookings = await Booking.find({ ride: req.params.rideId })
      .populate('passenger', 'name profilePhoto university passengerRating phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings'
    });
  }
};

// @desc    Approve booking
// @route   PUT /api/bookings/:id/approve
// @access  Private (Driver only)
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not pending'
      });
    }

    // Check if enough seats still available
    if (booking.ride.availableSeats < booking.seatsRequested) {
      return res.status(400).json({
        success: false,
        message: 'Not enough seats available'
      });
    }

    booking.status = 'confirmed';
    booking.confirmedAt = Date.now();
    await booking.save();

    // Update ride
    booking.ride.availableSeats -= booking.seatsRequested;
    booking.ride.passengers.push(booking.passenger);
    await booking.ride.save();

    // TODO: Notify passenger

    res.json({
      success: true,
      message: 'Booking approved successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve booking'
    });
  }
};

// @desc    Reject booking
// @route   PUT /api/bookings/:id/reject
// @access  Private (Driver only)
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not pending'
      });
    }

    booking.status = 'rejected';
    booking.rejectedAt = Date.now();
    await booking.save();

    // TODO: Notify passenger

    res.json({
      success: true,
      message: 'Booking rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject booking'
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only passenger can cancel
    if (booking.passenger.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled'
      });
    }

    const wasConfirmed = booking.status === 'confirmed';

    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancellationReason = req.body.reason;
    await booking.save();

    // If was confirmed, restore seats
    if (wasConfirmed) {
      booking.ride.availableSeats += booking.seatsRequested;
      booking.ride.passengers = booking.ride.passengers.filter(
        p => p.toString() !== req.user.id
      );
      await booking.ride.save();
    }

    // TODO: Notify driver

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};

// @desc    Mark payment as paid
// @route   PUT /api/bookings/:id/payment
// @access  Private
exports.markPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Either driver or passenger can mark as paid
    if (
      booking.driver.toString() !== req.user.id &&
      booking.passenger.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    booking.paymentStatus = 'paid';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment marked as paid'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment'
    });
  }
};

const Ride = require('../models/Ride');
const User = require('../models/User');

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private (Drivers only)
exports.createRide = async (req, res) => {
  try {
    const {
      origin,
      destination,
      date,
      time,
      availableSeats,
      costPerPassenger,
      preferences,
      notes
    } = req.body;

    // Combine date and time
    const departureDateTime = new Date(`${date}T${time}`);

    // Check if departure is in the future
    if (departureDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Departure time must be in the future'
      });
    }

    const ride = await Ride.create({
      driver: req.user.id,
      origin,
      destination,
      date: departureDateTime,
      time,
      departureDateTime,
      availableSeats,
      totalSeats: availableSeats,
      costPerPassenger,
      preferences: preferences || {},
      notes
    });

    await ride.populate('driver', 'name profilePhoto university driverRating');

    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      data: { ride }
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create ride'
    });
  }
};

// @desc    Search rides
// @route   GET /api/rides/search
// @access  Public
exports.searchRides = async (req, res) => {
  try {
    const { origin, destination, date, minSeats } = req.query;

    const query = {
      status: 'scheduled',
      availableSeats: { $gte: minSeats || 1 }
    };

    if (origin) {
      query.origin = { $regex: origin, $options: 'i' };
    }

    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    } else {
      // Show only future rides
      query.departureDateTime = { $gte: new Date() };
    }

    const rides = await Ride.find(query)
      .populate('driver', 'name profilePhoto university driverRating vehicle')
      .sort({ departureDateTime: 1 })
      .limit(50);

    res.json({
      success: true,
      count: rides.length,
      data: { rides }
    });
  } catch (error) {
    console.error('Search rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search rides'
    });
  }
};

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Public
exports.getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name profilePhoto university driverRating vehicle phone')
      .populate('passengers', 'name profilePhoto university passengerRating');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.json({
      success: true,
      data: { ride }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get ride'
    });
  }
};

// @desc    Get user's rides (as driver)
// @route   GET /api/rides/my-rides
// @access  Private
exports.getMyRides = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { driver: req.user.id };
    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate('passengers', 'name profilePhoto passengerRating')
      .sort({ departureDateTime: -1 });

    res.json({
      success: true,
      count: rides.length,
      data: { rides }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get your rides'
    });
  }
};

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private (Driver only)
exports.updateRide = async (req, res) => {
  try {
    let ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is the driver
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ride'
      });
    }

    // Don't allow updating completed or cancelled rides
    if (ride.status === 'completed' || ride.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled rides'
      });
    }

    const allowedUpdates = ['time', 'costPerPassenger', 'preferences', 'notes'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    ride = await Ride.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('driver', 'name profilePhoto');

    res.json({
      success: true,
      message: 'Ride updated successfully',
      data: { ride }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update ride'
    });
  }
};

// @desc    Cancel ride
// @route   DELETE /api/rides/:id
// @access  Private (Driver only)
exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ride'
      });
    }

    if (ride.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed ride'
      });
    }

    ride.status = 'cancelled';
    await ride.save();

    // TODO: Notify all passengers

    res.json({
      success: true,
      message: 'Ride cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel ride'
    });
  }
};

// @desc    Complete ride
// @route   POST /api/rides/:id/complete
// @access  Private (Driver only)
exports.completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

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

    ride.status = 'completed';
    await ride.save();

    // Update driver's ride count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { ridesAsDriver: 1 }
    });

    res.json({
      success: true,
      message: 'Ride marked as completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete ride'
    });
  }
};

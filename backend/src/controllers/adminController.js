const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Report = require('../models/Report');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { status, university, role, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (university) query.university = university;
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'suspended', 'banned'

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
exports.getAllReports = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const reports = await Report.find(query)
      .populate('reporter', 'name email university')
      .populate('reportedUser', 'name email university')
      .populate('reportedRide', 'origin destination date')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Report.countDocuments(query);

    res.json({
      success: true,
      count: reports.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: { reports }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get reports'
    });
  }
};

// @desc    Resolve report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (Admin only)
exports.resolveReport = async (req, res) => {
  try {
    const { status, adminNotes } = req.body; // 'resolved' or 'dismissed'

    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        resolvedBy: req.user.id,
        resolvedAt: Date.now()
      },
      { new: true }
    ).populate('reporter', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report resolved',
      data: { report }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to resolve report'
    });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments({ status: 'active' });
    const totalDrivers = await User.countDocuments({
      status: 'active',
      role: { $in: ['driver', 'both'] }
    });
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    const activeRides = await Ride.countDocuments({ status: 'scheduled' });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersLastWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const ridesLastWeek = await Ride.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Top universities
    const topUniversities = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$university', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Popular routes
    const popularRoutes = await Ride.aggregate([
      {
        $group: {
          _id: { origin: '$origin', destination: '$destination' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDrivers,
          totalRides,
          completedRides,
          activeRides,
          totalBookings,
          confirmedBookings,
          pendingReports
        },
        recentActivity: {
          newUsersLastWeek,
          ridesLastWeek
        },
        topUniversities: topUniversities.map(u => ({
          university: u._id,
          count: u.count
        })),
        popularRoutes: popularRoutes.map(r => ({
          origin: r._id.origin,
          destination: r._id.destination,
          count: r.count
        }))
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
};

// @desc    Submit a report
// @route   POST /api/admin/reports
// @access  Private
exports.submitReport = async (req, res) => {
  try {
    const { type, reportedUserId, reportedRideId, reason, description } = req.body;

    const reportData = {
      reporter: req.user.id,
      type,
      reason,
      description
    };

    if (type === 'user') {
      reportData.reportedUser = reportedUserId;
    } else if (type === 'ride') {
      reportData.reportedRide = reportedRideId;
    }

    const report = await Report.create(reportData);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit report'
    });
  }
};

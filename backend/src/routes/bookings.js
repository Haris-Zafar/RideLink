const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  requestBooking,
  getMyBookings,
  getRideBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  markPayment
} = require('../controllers/bookingController');

router.post('/request', protect, requestBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/ride/:rideId', protect, getRideBookings);
router.put('/:id/approve', protect, approveBooking);
router.put('/:id/reject', protect, rejectBooking);
router.delete('/:id/cancel', protect, cancelBooking);
router.put('/:id/payment', protect, markPayment);

module.exports = router;

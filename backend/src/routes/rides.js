const express = require('express');
const router = express.Router();
const { protect, driversOnly } = require('../middleware/auth');
const {
  createRide,
  searchRides,
  getRide,
  getMyRides,
  updateRide,
  cancelRide,
  completeRide
} = require('../controllers/rideController');

router.post('/', protect, driversOnly, createRide);
router.get('/search', searchRides);
router.get('/my-rides', protect, getMyRides);
router.get('/:id', getRide);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, cancelRide);
router.post('/:id/complete', protect, completeRide);

module.exports = router;

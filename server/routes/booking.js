const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');

router.post('/check-availability/:serviceId', auth, bookingController.checkAvailability);
router.post('/', auth, bookingController.createBooking);
router.get('/', auth, bookingController.getAllBookings);
router.put('/:id', auth, bookingController.updateBooking);
router.delete('/:id', auth, bookingController.deleteBooking);
router.get('/available-times/:serviceId', auth, bookingController.getAvailableTimes);
router.post('/shipment', auth, bookingController.createShipmentBooking);

module.exports = router;
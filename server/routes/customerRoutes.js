const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.get('/:customerId/bookings', customerController.getBookingsByCustomerId); 

module.exports = router;
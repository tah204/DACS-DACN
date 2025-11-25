const express = require('express');
const router = express.Router();
const paymentPayPalController = require('../controllers/paymentPayPalController');
const authMiddleware = require('../middleware/authMiddleware'); // Bảo vệ API

/**
 * @route POST /api/payment/paypal/create-order
 * @desc Tạo một đơn hàng PayPal (trả về orderID của PayPal)
 * @access Private
 */
router.post('/create-order', authMiddleware, paymentPayPalController.createOrder);

/**
 * @route POST /api/payment/paypal/capture-order
 * @desc Hoàn tất (capture) thanh toán sau khi người dùng xác nhận
 * @access Private
 */
router.post('/capture-order', authMiddleware, paymentPayPalController.captureOrder);

module.exports = router;
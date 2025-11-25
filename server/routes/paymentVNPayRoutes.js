const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentVNPayController');

/**
 * URL VNPAY sẽ redirect trình duyệt của người dùng về
 * (Khớp với VNP_RETURN_URL trong file .env)
 * * VD: http://localhost:5000/api/payment/vnpay/vnpay_return
 */
router.get('/vnpay_return', paymentController.vnpayReturn);

/**
 * URL VNPAY sẽ gọi server-to-server (IPN)
 * Dùng để xác nhận thanh toán ở môi trường Production (sản phẩm thật).
 */
router.get('/vnpay_ipn', paymentController.vnpayIPN);

// Tạo link thanh toán để test nhanh qua Postman
router.post('/create', paymentController.generatePaymentLink);

module.exports = router;
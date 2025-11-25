const express = require('express');
const router = express.Router();
const paymentMoMoController = require('../controllers/paymentMoMoController');

/**
 * URL MoMo sẽ redirect trình duyệt của người dùng về
 * (Khớp với MOMO_RETURN_URL trong file .env)
 * Phương thức: GET
 */
router.get('/momo_return', paymentMoMoController.momoReturn);

/**
 * URL MoMo sẽ gọi server-to-server (IPN)
 * (Khớp với MOMO_NOTIFY_URL trong file .env)
 * Phương thức: POST
 */
router.post('/momo_notify', paymentMoMoController.momoNotify);

// Tạo link thanh toán MoMo cho booking hiện có
router.post('/create', paymentMoMoController.createMoMoPaymentLink);

module.exports = router;
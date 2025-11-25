const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  createDoctorReview, // <-- 1. Import hàm mới
} = require('../controllers/doctorController');

// 2. Import middleware của bạn
const authMiddleware = require('../middleware/authMiddleware');

// === CÁC ROUTE PUBLIC (KHÔNG CẦN TOKEN) ===
// GET /api/doctors
router.route('/').get(getAllDoctors);
// GET /api/doctors/:id
router.route('/:id').get(getDoctorById);

// === ROUTE PRIVATE (CẦN TOKEN CUSTOMER) ===
// POST /api/doctors/:id/reviews
// 3. Áp dụng authMiddleware chỉ cho route này
router.route('/:id/reviews').post(authMiddleware, createDoctorReview);

module.exports = router;
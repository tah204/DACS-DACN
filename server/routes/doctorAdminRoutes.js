const express = require('express');
const router = express.Router();
const {
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');

// Chỉ admin mới có quyền tạo, sửa, xóa
// POST /admin/doctors
router.route('/').post(createDoctor);

// PUT /admin/doctors/:id
// DELETE /admin/doctors/:id
router.route('/:id').put(updateDoctor).delete(deleteDoctor);

module.exports = router;
// routes/mapRoutes.js – FIX + LOG CHI TIẾT ĐỂ DEBUG
const express = require('express');
const router = express.Router();
const { calculateDistance } = require('../services/mapService');  // Đảm bảo tên file đúng

router.post('/calculate', async (req, res) => {
  try {
    const { origin, destination } = req.body;

    console.log(`[ROUTE] Nhận request: origin="${origin}", destination="${destination}"`);

    if (!origin || !destination) {
      return res.status(400).json({ message: 'Thiếu origin hoặc destination' });
    }

    const result = await calculateDistance(origin, destination);

    console.log(`[ROUTE] Kết quả thành công: ${result.distanceText}, ${result.durationText}`);

    res.json(result);
  } catch (err) {
    console.error('[ROUTE] Lỗi đầy đủ:', err.message, err.response?.data);
    res.status(500).json({ 
      message: 'Lỗi tính khoảng cách', 
      error: err.message,
      details: err.response?.data || 'Unknown'
    });
  }
});

module.exports = router;
// routes/mapRoutes.js
const express = require('express');
const router = express.Router();
const { calculateDistance } = require('../services/mapService'); // tên file đúng của bạn

router.post('/calculate', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ message: 'Thiếu địa chỉ đón hoặc trả' });
  }

  try {
    const result = await calculateDistance(origin, destination);
    res.json(result);
  } catch (err) {
    console.error('Lỗi tính khoảng cách:', err.message);
    res.status(500).json({ 
      message: 'Không thể tính khoảng cách',
      // Fallback để app không crash
      distanceText: '10 km',
      distanceValue: 10000,
      durationText: '20 phút'
    });
  }
});

module.exports = router;
const { Client } = require("@googlemaps/google-maps-services-js");
const dotenv = require('dotenv');

dotenv.config();

const USE_MOCK_MAPS = true; 

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error("❌ GOOGLE_MAPS_API_KEY không tồn tại! Kiểm tra .env.");
}

const client = new Client({});

const calculateDistance = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Thiếu địa điểm xuất phát hoặc địa điểm đến.");
  }

  // --- MOCK MODE ---
  if (USE_MOCK_MAPS) {
    console.log(`⚠️ [FREE MODE] Tính thử: ${origin} -> ${destination}`);
    
    let distanceKm = 0;
    const lowerOrigin = origin.toLowerCase();
    const lowerDest = destination.toLowerCase();

    if (lowerOrigin.includes('sân bay') || lowerDest.includes('sân bay')) {
      distanceKm = 8.5;
    } else if (lowerOrigin.includes('quận 1') || lowerDest.includes('quận 1')) {
      distanceKm = 3.0;
    } else {
      distanceKm = (Math.random() * (15 - 5) + 5).toFixed(1);
    }

    const distanceValue = Math.floor(distanceKm * 1000);
    const durationValue = Math.floor(distanceValue / 500 * 60);

    return {
      distanceText: `${distanceKm} km`,
      distanceValue,
      durationText: `${Math.floor(durationValue / 60)} mins`,
      durationValue
    };
  }

  // --- GOOGLE API MODE ---
  try {
    console.log("🌐 [GOOGLE REAL] Gọi API...");

    const response = await client.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.GOOGLE_MAPS_API_KEY,
        language: 'vi',
        mode: 'driving',
      },
      timeout: 5000,
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google API Error: ${response.data.status}`);
    }

    const element = response.data.rows[0].elements[0];

    if (element.status !== 'OK') {
      throw new Error(`Google Element Error: ${element.status}`);
    }

    return {
      distanceText: element.distance.text,
      distanceValue: element.distance.value,
      durationText: element.duration.text,
      durationValue: element.duration.value
    };

  } catch (error) {
    console.error("❌ Google Maps Error:", error.message);
    console.log("⚠️ Fallback sang MOCK để app không chết.");

    return {
      distanceText: "5.5 km (Fallback)",
      distanceValue: 5500,
      durationText: "15 mins",
      durationValue: 900
    };
  }
};

module.exports = { calculateDistance };

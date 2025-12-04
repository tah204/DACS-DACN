// src/components/map/GoongMap.jsx – FIX WARNING CSS + MARKER HIỆN RÕ NHƯ GOOGLE MAPS

import React, { useEffect, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';

const GoongMap = ({ pickup, dropoff }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const pickupMarker = useRef(null);
  const dropoffMarker = useRef(null);

  const MAP_KEY = 'null';
  const API_KEY = 'null';

  // Helper: Tạo element từ HTML cho marker
  const createMarkerElement = (color, letter) => {
    const div = document.createElement('div');
    div.style.cssText = `
      width: 40px; height: 40px; 
      background: ${color}; 
      border: 4px solid white; 
      border-radius: 50%; 
      display: flex; align-items: center; justify-content: center; 
      font-weight: bold; font-size: 18px; color: white; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.3); 
      cursor: pointer;
    `;
    div.innerHTML = letter;
    return div;
  };

  const getCoordsFromAddress = async (address) => {
    if (!address || address.length < 5) return null;
    try {
      const res = await fetch(
        `https://rsapi.goong.io/geocode?address=${encodeURIComponent(address)}&api_key=${API_KEY}`
      );
      const data = await res.json();
      if (data.results?.[0]) {
        const loc = data.results[0].geometry.location;
        return `${loc.lat},${loc.lng}`;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    if (!map.current) {
      goongjs.accessToken = MAP_KEY;
      map.current = new goongjs.Map({
        container: mapContainer.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [106.7009, 10.7769],
        zoom: 11
        // Bỏ pitch để giảm warning Canvas
      });
    }

    const updateMap = async () => {
      if (!pickup || !dropoff || pickup.length < 10 || dropoff.length < 10) {
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }
        // Reset marker về trung tâm nếu không có địa chỉ
        if (pickupMarker.current) pickupMarker.current.setLngLat([106.7009, 10.7769]);
        if (dropoffMarker.current) dropoffMarker.current.setLngLat([106.7009, 10.7769]);
        return;
      }

      try {
        const originCoords = await getCoordsFromAddress(pickup);
        const destCoords = await getCoordsFromAddress(dropoff);

        if (!originCoords || !destCoords) return;

        const url = `https://rsapi.goong.io/Direction?origin=${originCoords}&destination=${destCoords}&vehicle=car&api_key=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        if (!data.routes?.[0]) return;

        const route = data.routes[0];
        const coordinates = decodePolyline(route.overview_polyline.points);
        const start = coordinates[0];
        const end = coordinates[coordinates.length - 1];

        // Tạo hoặc cập nhật marker đón (xanh lá + chữ A)
        const pickupEl = createMarkerElement('#4CAF50', 'A');  // Xanh lá
        if (!pickupMarker.current) {
          pickupMarker.current = new goongjs.Marker({ element: pickupEl })
            .setLngLat(start)
            .setPopup(new goongjs.Popup({ offset: [0, -30] }).setHTML(`<div class="p-2"><strong>Điểm đón</strong><br>${pickup}</div>`))
            .addTo(map.current);
        } else {
          pickupMarker.current.setLngLat(start);
          pickupMarker.current.setPopup(new goongjs.Popup({ offset: [0, -30] }).setHTML(`<div class="p-2"><strong>Điểm đón</strong><br>${pickup}</div>`));
        }

        // Tạo hoặc cập nhật marker trả (đỏ + chữ B)
        const dropoffEl = createMarkerElement('#F44336', 'B');  // Đỏ
        if (!dropoffMarker.current) {
          dropoffMarker.current = new goongjs.Marker({ element: dropoffEl })
            .setLngLat(end)
            .setPopup(new goongjs.Popup({ offset: [0, -30] }).setHTML(`<div class="p-2"><strong>Điểm trả</strong><br>${dropoff}</div>`))
            .addTo(map.current);
        } else {
          dropoffMarker.current.setLngLat(end);
          dropoffMarker.current.setPopup(new goongjs.Popup({ offset: [0, -30] }).setHTML(`<div class="p-2"><strong>Điểm trả</strong><br>${dropoff}</div>`));
        }

        // Vẽ đường xanh (giữ nguyên)
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#007bff',
            'line-width': 9,
            'line-opacity': 0.95
          },
          layout: { 'line-cap': 'round', 'line-join': 'round' }
        });

        // Zoom vừa lộ trình
        const bounds = new goongjs.LngLatBounds();
        coordinates.forEach(c => bounds.extend(c));
        map.current.fitBounds(bounds, { padding: 120, duration: 1500 });

      } catch (err) {
        console.log('Update map error:', err.message);  // Chỉ log để debug
      }
    };

    updateMap();
  }, [pickup, dropoff]);

  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      let dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1)); lat += dlat;
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      let dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1)); lng += dlng;
      points.push([lng * 1e-5, lat * 1e-5]);
    }
    return points;
  };

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '520px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: '6px solid white'
      }}
    />
  );
};

export default GoongMap;
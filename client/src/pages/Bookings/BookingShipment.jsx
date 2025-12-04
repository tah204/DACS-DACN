// src/pages/BookingShipment.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import GoongMap from '../../components/map/GoongMap';
import './BookingShipment.css';

const BookingShipment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [distanceInfo, setDistanceInfo] = useState(null);

  // Gợi ý địa chỉ
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

  // Ref để detect click ngoài
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  const [formData, setFormData] = useState({
    petId: '',
    serviceId: '',
    bookingDate: null, 
    pickupAddress: '',
    dropoffAddress: '',
    notes: '',
    paymentMethod: 'cod'
  });

  // Load pets + services
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const [petRes, serviceRes] = await Promise.all([
          axios.get('http://localhost:5000/api/pets', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/services', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const shipmentServices = serviceRes.data.filter(s => String(s.category) === '4' || (s.category?._id === '4'));
        setPets(petRes.data);
        setServices(shipmentServices);

        // Set mặc định
        if (shipmentServices.length > 0) setFormData(prev => ({ ...prev, serviceId: shipmentServices[0]._id }));
      } catch (err) {
        toast.error('Không tải được dữ liệu');
      }
    };
    load();
  }, []);

  // Tính khoảng cách
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.pickupAddress && formData.dropoffAddress) {
        try {
          const res = await axios.post('http://localhost:5000/api/maps/calculate', {
            origin: formData.pickupAddress,
            destination: formData.dropoffAddress
          });
          const km = (res.data.distanceValue / 1000).toFixed(1);
          setDistanceInfo({
            distance: `${km} km`,
            duration: res.data.durationText,
            distanceKm: parseFloat(km)
          });
        } catch (err) {
          setDistanceInfo(null);
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.pickupAddress, formData.dropoffAddress]);

  // Gợi ý địa chỉ
  const searchPlaces = async (input, setSuggestions) => {
    if (input.length < 2) return setSuggestions([]);
    try {
      const res = await axios.get('https://rsapi.goong.io/Place/AutoComplete', {
        params: { input, api_key: 'null' }
      });
      setSuggestions(res.data.predictions || []);
    } catch (err) {
      setSuggestions([]);
    }
  };

  // Click ngoài để tắt gợi ý
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target)) setPickupSuggestions([]);
      if (dropoffRef.current && !dropoffRef.current.contains(e.target)) setDropoffSuggestions([]);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedService = services.find(s => s._id === formData.serviceId);
  const totalPrice = selectedService && distanceInfo
    ? Math.round(selectedService.price * distanceInfo.distanceKm)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!distanceInfo) return toast.error('Chưa có lộ trình');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/bookings/shipment', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đặt vận chuyển thành công!');
      setTimeout(() => navigate('/mybookings'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="container py-5">
        
        {/* ĐÃ CHỈNH SỬA: Thay thế class Bootstrap bằng class CSS đặc trưng */}
        <h2 className="text-center mb-5 title-shipment">Vận Chuyển Thú Cưng</h2>

        <div className="row g-5">
          {/* FORM */}
          <div className="col-lg-7">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">

                <form onSubmit={handleSubmit}>

                  {/* CHỌN THÚ CƯNG */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Chọn thú cưng của bạn</label>
                    <select
                      className="form-select form-select-lg"
                      value={formData.petId}
                      onChange={e => setFormData({ ...formData, petId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn thú cưng --</option>
                      {pets.map(pet => (
                        <option key={pet._id} value={pet._id}>
                          {pet.name} - {pet.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CHỌN DỊCH VỤ */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Loại dịch vụ</label>
                    <select
                      className="form-select form-select-lg"
                      value={formData.serviceId}
                      onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                      required
                    >
                      {services.map(service => (
                        <option key={service._id} value={service._id}>
                          {service.name} - {service.price.toLocaleString()}đ/km
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* NGÀY GIỜ ĐÓN */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Ngày giờ đón</label>
                    <DatePicker
                      selected={formData.bookingDate}
                      onChange={date => setFormData({ ...formData, bookingDate: date })}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      minDate={new Date()}
                      className="form-control form-control-lg"
                      placeholderText="Chọn ngày giờ đón"
                      required
                    />
                  </div>

                  {/* ĐIỂM ĐÓN */}
                  <div className="mb-4 position-relative" ref={pickupRef}>
                    <label className="form-label fw-bold text-success">Điểm đón</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Nhà bạn ở đâu?"
                      value={formData.pickupAddress}
                      onChange={e => {
                        setFormData({ ...formData, pickupAddress: e.target.value });
                        searchPlaces(e.target.value, setPickupSuggestions);
                      }}
                      required
                    />
                    {pickupSuggestions.length > 0 && (
                      <div className="position-absolute bg-white border shadow-lg w-100 mt-1 rounded" style={{ zIndex: 9999, maxHeight: '300px', overflowY: 'auto' }}>
                        {pickupSuggestions.map((item, i) => (
                          <div
                            key={i}
                            className="p-3 border-bottom hover-bg-light cursor-pointer"
                            onClick={() => {
                              setFormData({ ...formData, pickupAddress: item.description });
                              setPickupSuggestions([]);
                            }}
                          >
                            {item.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ĐIỂM TRẢ */}
                  <div className="mb-4 position-relative" ref={dropoffRef}>
                    <label className="form-label fw-bold text-danger">Điểm trả</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Bé đi đâu?"
                      value={formData.dropoffAddress}
                      onChange={e => {
                        setFormData({ ...formData, dropoffAddress: e.target.value });
                        searchPlaces(e.target.value, setDropoffSuggestions);
                      }}
                      required
                    />
                    {dropoffSuggestions.length > 0 && (
                      <div className="position-absolute bg-white border shadow-lg w-100 mt-1 rounded" style={{ zIndex: 9999, maxHeight: '300px', overflowY: 'auto' }}>
                        {dropoffSuggestions.map((item, i) => (
                          <div
                            key={i}
                            className="p-3 border-bottom hover-bg-light cursor-pointer"
                            onClick={() => {
                              setFormData({ ...formData, dropoffAddress: item.description });
                              setDropoffSuggestions([]);
                            }}
                          >
                            {item.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* GHI CHÚ */}
                  <div className="mb-4">
                    <label className="form-label">Ghi chú cho tài xế (tùy chọn)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Ví dụ: Bé sợ tiếng ồn, vui lòng đi nhẹ nhàng..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  {/* HIỂN THỊ GIÁ */}
                  {distanceInfo && selectedService && (
                    <div className="alert alert-success text-center p-5 rounded-4 mb-4 border border-success shadow">
                      <h4 className="mb-3 text-dark">
                        {distanceInfo.distance} • {distanceInfo.duration}
                      </h4>
                      <h1 className="text-danger fw-bold mb-0">
                        TỔNG TIỀN: {totalPrice.toLocaleString('vi-VN')} ₫
                      </h1>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-danger btn-lg w-100 py-4 fw-bold fs-4 shadow"
                    disabled={loading || !distanceInfo}
                  >
                    {loading ? 'Đang xử lý...' : 'ĐẶT XE NGAY'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* BẢN ĐỒ */}
          <div className="col-lg-5">
            <div 
                className="card shadow-lg border-0 sticky-top" 
            >
              <div className="card-body p-0 rounded-4 overflow-hidden">
                <GoongMap pickup={formData.pickupAddress} dropoff={formData.dropoffAddress} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingShipment;